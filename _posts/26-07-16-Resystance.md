---
title: "[ICDE'26] Resystance: Unleashing Hidden Performance of Compaction in LSM-trees via eBPF"
date: 2026-07-16
categories: [LSM-tree]
tags: [LSM-tree]
paper_review: true
summary: "."
---

LSM-tree compaction이 일으키는 시스템 콜 오버헤드를 eBPF와 io_uring으로 줄여, 숨어 있던 성능을 끌어내는 것이 목표입니다. 


## 1. 문제
병목이 하드웨어에서 소프트웨어로 이동함
- NVMe SSD는 GB/s 수준의 대역폭과 µs 수준의 지연시간을 냄 → 시스템 콜과 커널↔유저 공간 전환이 병목 
- RocksDB의 Get 중 pread() 한 번은 약 180µs가 걸림 → 68.5%가 소프트웨어 스택이 차지

시스템 콜의 주범은 compaction
- Put과 Get은 연산당 시스템 콜이 거의 없음(0, 0.5회)
- Flush는 약 107회인데 compaction은 약 66,983회입니다 → compaction 중 시스템 콜의 96.09%가 pread()
  - 원인: compaction이 SSTable을 블록 단위로 읽으면서 데이터 블록마다 pread()를 한 번씩 부름 = 4KB 블록의 64MB SSTable이라면 테이블 하나당 약 2^14번 호출

커널 바이패스(SPDK, XRP 등)는 현실적이지 x
- VFS와 블록 계층을 우회 → 파일 시스템을 다시 설계해야 함 커널 기능(e.g., 스케줄링, readahead)도 잃음 

<!--
## 2. eBPF를 고른 이유와 해결해야 할 과제

eBPF는 verifier가 안전성을 보장하고, 컨텍스트 스위칭이나 복사 없이 커널 안에서 로직을 실행하며, 커널 소스를 고칠 필요도 없습니다. 대신 세 가지 과제가 있습니다. 
arxiv

Verifier 제약: 명령어 수, 루프, 스택, 호출 깊이 제한이 엄격해서 merge-sort나 iterator를 구현하기 어렵습니다.
기능 분할: 어디까지를 eBPF로 옮길지 정해야 합니다. 너무 많이 옮기면 verifier가 거부하고, 너무 적게 옮기면 효과가 없습니다.
커널 안정성: verifier는 외부 커널 코드와의 상호작용까지는 검사하지 않습니다. 
arxiv
## 3. 설계

구조는 3계층입니다. Controller가 진행 상황을 관리하고 I/O를 발행합니다. io_uring은 비동기 일괄(batch) 읽기를, eBPF 프로그램은 merge를 맡습니다. 핵심은 ReadNextKV 한 번의 호출로 여러 블록을 읽고 merge까지 eBPF 안에서 끝내서, iterator 호출 횟수를 크게 줄이는 것입니다. 
arxiv

SST-Map: 유저와 커널이 공유하는 메모리에 둔 메타데이터 구조입니다. compaction 대상 SSTable마다 블록 인덱스, 오프셋, 크기를 미리 정리해 둡니다. 이미 메모리에 있는 메타데이터로 만들기 때문에 비용이 작습니다. 
arxiv
처리 흐름:
모든 입력 SSTable의 첫 블록을 한꺼번에 요청합니다.
eBPF가 커널 버퍼 위에서 iterator 방식으로 merge합니다.
블록 하나를 다 소비하면 controller가 다음 블록 읽기를 발행합니다.
출력 버퍼가 차면 결과를 반환합니다.
쓰기는 기존 유저 공간 WriteKV()가 그대로 처리합니다.
분할 원칙: eBPF로 옮기는 것은 merge 단계뿐입니다. 쓰기는 크고 드물게 일어나서 시스템 콜 비용이 상대적으로 작습니다. 읽기는 eBPF에 디스크 I/O helper가 없어서 아직 옮길 수 없습니다. 
arxiv
Merge 알고리즘: 입력 파일이 6개 이하이면 linear search를, 그보다 많으면 BPF map 기반 min-heap(O(K log N))을 씁니다. 
arxiv
안정성 장치: verifier의 명령어 제한(기본 100만)을 완화하고, is_valid_access를 고쳐 eBPF가 미리 정한 커널 메모리 영역만 접근하게 합니다. 또 데이터에 따라 다음 I/O가 결정되는 연쇄 I/O(data chasing)를 피해서, 작업이 반드시 끝나도록 보장합니다.
RESYSTANCE-K: eBPF 로직을 커널에 직접 넣고 compaction 전체를 io_uring 안에서 실행하는 변형입니다. eBPF 호출 오버헤드가 없어서 조금 더 빠릅니다. 
arxiv
## 4. 구현과 실험 환경
구현: Linux 6.14와 RocksDB 10.1.3을 사용했습니다. 새 시스템 콜은 없고, 전용 io_uring 플래그로 기능을 호출합니다. RocksDB에서는 compaction_job.cc에서 iterator 호출을 io_uring_enter로 바꾼 것이 주된 변경입니다. 소스는 GitHub의 DISCOS-LAB/Resystance에 공개되어 있습니다. 
arxiv
하드웨어: Ryzen 9 7950X, 32GB DDR5, Samsung 990 PRO 1TB, ext4.
RocksDB 설정: WAL, 블록 캐시, 압축을 끄고 Direct I/O를 사용했습니다.
워크로드: db_bench, YCSB A–F, 그리고 Sysbench 기반 OLTP(MariaDB + MyRocks)입니다.
## 5. 주요 결과
항목	결과
compaction 시스템 콜	99% 이상 감소
compaction 시간	약 50% 감소
FillRandom 처리량	최대 75% 향상
FillRandom p99 지연	최대 40% 감소
ReadWhileWriting	최대 57% 향상
YCSB	Load 최대 85%, A 최대 53% 향상
OLTP (read_write)	22% 향상
읽기 위주 워크로드와 scan 워크로드에서는 이득이 작고, I/O 스레드가 늘수록 격차가 커집니다. 
arxiv
Linear merge는 SST가 약 24개를 넘으면 100만 명령어 제한을 초과합니다. 반면 min-heap은 2만~10만 명령어, 검증 시간 0.05초 미만에 머뭅니다. 
arxiv
SPDK+BlobFS의 이득은 크지 않았고, 그마저도 대부분 커널 바이패스가 아니라 자체 유저 공간 캐시 덕분이었습니다. io_uring만 단독으로 쓰면 compaction은 거의 개선되지 않았습니다. 즉 성능 향상은 io_uring과 eBPF merge를 함께 쓸 때 나옵니다. 
arxiv
## 6. 의의와 한계

의의: LSM-tree의 구조와 compaction 알고리즘은 그대로 둡니다. 표준 커널 I/O 경로(VFS, 블록 계층)를 유지하면서 시스템 콜 오버헤드만 걷어냈습니다. 그래서 KVell처럼 저장 엔진을 새로 설계하거나 SPDK처럼 커널을 우회하는 방식보다 기존 시스템에 적용하기 쉽습니다.

한계: 논문에 별도의 한계 섹션은 없어서, 아래는 본문을 바탕으로 정리한 것입니다.

eBPF로 옮긴 것은 merge뿐이고 읽기와 쓰기는 유저 공간에 남아 있습니다.
verifier 제한 완화와 is_valid_access 수정은 실제 커널 수정입니다.
실험이 단일 하드웨어, ext4, 커널 6.14 한 가지 조합으로만 이루어졌습니다.
CPU 사용률은 보고하지 않았습니다.
RESYSTANCE-K는 RESYSTANCE 대비 추가 이득이 작습니다.
-->