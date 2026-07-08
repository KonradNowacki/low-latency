---
layout: default
title: Home
---

# Latest posts

<ul class="post-list">
  {% for post in site.posts %}
  <li>
    <img class="post-thumb" src="{{ post.image | default: '/assets/images/default-cover.png' | relative_url }}" alt="{{ post.title }}" loading="lazy">
    <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    {% if post.excerpt %}
      <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>

