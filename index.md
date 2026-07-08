---
layout: default
title: Home
---

# Latest posts

<ul class="post-list">
  {% for post in site.posts %}
  <li>
    <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    {% if post.excerpt %}
      <p class="post-excerpt">{{ post.excerpt | strip_html | truncatewords: 30 }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>

{% for post in site.posts %}
{{ post.title }}
{{ post.date | date: "%Y-%m-%d" }} {{ post.title }} {% if post.excerpt %}
{{ post.excerpt | strip_html | truncatewords: 30 }}

{% endif %}
{% endfor %}