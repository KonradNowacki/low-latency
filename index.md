---
layout: default
title: Blog
---

<h1>Posts</h1>

<div class="posts">

{% for post in site.posts %}

<article class="post-card">

{% if post.image %}
<a href="{{ post.url | relative_url }}">
<img
class="post-card-image"
src="{{ post.image | relative_url }}"
alt="{{ post.title }}">
</a>
{% endif %}

  <div class="post-card-content">

    <h2>
      <a href="{{ post.url | relative_url }}">
        {{ post.title }}
      </a>
    </h2>

    {% if post.description %}
    <p class="post-description">
      {{ post.description }}
    </p>
    {% endif %}

    <div class="post-meta-row">

      <img
        class="avatar-small"
        src="/assets/images/konrad_avatar.png"
        alt="{{ post.author }}">

      <span class="author-name">
        {{ post.author }}
      </span>

      <span class="meta-separator">•</span>

      <span>
        {{ post.date | date: "%B %-d, %Y" }}
      </span>

      <span class="meta-separator">•</span>

      <span>
        {{ post.reading_time }}
      </span>

      {% if post.tags %}
        <div> 
            {% for tag in post.tags %}
              <span class="tag">{{ tag }}</span>
            {% endfor %}
        </div>
      {% endif %}

    </div>

  </div>

</article>

{% endfor %}

</div>