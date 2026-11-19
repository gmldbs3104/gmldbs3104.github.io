---
layout: page
title: Contact
subtitle: 편한 방법으로 연락 주세요
permalink: /contact/
sidebar: false
description: "연락처 및 소셜 링크"
---

새로운 일, 협업 제안, 글에 대한 피드백 모두 환영합니다.
보통 평일 기준 하루 안에 답장합니다.

<div class="contact-grid">
  <a class="contact-card" href="mailto:{{ site.author.email }}">
    <h3>Email</h3>
    <p>{{ site.author.email }}</p>
  </a>
  <a class="contact-card" href="https://github.com/{{ site.social.github }}" rel="me noopener">
    <h3>GitHub</h3>
    <p>{{ site.social.github }}</p>
  </a>
  <a class="contact-card" href="https://www.linkedin.com/in/{{ site.social.linkedin }}/" rel="me noopener">
    <h3>LinkedIn</h3>
    <p>{{ site.author.name }}</p>
  </a>
</div>
