---
title: "useEffect 의존성 배열, 언제 무엇을 넣어야 하나"
date: 2026-07-20 10:00:00 +0900
categories: [React]
tags: [React, JavaScript]
summary: "의존성 배열을 비우면 왜 오래된 값을 참조하게 되는지, 함수를 넣으면 왜 매번 다시 실행되는지 실제 예제로 정리했습니다."
read_time: "6분"
popular: true
---

`useEffect`의 의존성 배열은 "이 값이 바뀌면 다시 실행해라"라는 뜻입니다.
그런데 실무에서 자주 나오는 버그는 대부분 이 문장을 반대로 이해할 때 생깁니다.

## 빈 배열이 안전하지 않은 이유

```jsx
function Timer({ onTick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // 항상 0 + 1
    }, 1000);
    return () => clearInterval(id);
  }, []); // count를 넣지 않았다
}
```

이펙트가 처음 만들어질 때의 `count`(0)를 클로저가 계속 붙잡고 있습니다.
값이 아니라 **업데이트 함수**를 쓰면 의존성 자체가 사라집니다.

```jsx
setCount((prev) => prev + 1);
```

## 함수를 의존성에 넣을 때

부모에서 매 렌더마다 새 함수를 만들어 내려주면, 그 함수를 의존성에 넣은 이펙트는
매 렌더마다 다시 실행됩니다. 이때는 값을 고정하는 쪽이 아니라 함수를 고정하는 쪽,
즉 `useCallback`을 부모에 두는 것이 맞습니다.

## 정리

- 이펙트 안에서 읽는 모든 값은 의존성에 넣는다
- 넣기 싫은 값이 있다면 이펙트 밖으로 빼거나 업데이트 함수를 쓴다
- 린트 경고를 끄기 전에 왜 경고가 났는지 먼저 읽는다
