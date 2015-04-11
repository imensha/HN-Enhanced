// ==UserScript==
// @name        HN Collapsible
// @namespace   HNC
// @description Collapsible comments on Hacker News
// @include     https://news.ycombinator.com/item?id=*
// @version     0.1
// @grant       none
// ==/UserScript==
var d = document;
var c = console;
var container = d.querySelectorAll("table")[3];
var rows = container.tBodies[0].rows;
for(var i = 0; i < rows.length; i++) {
  var row = rows[i];
  parseRow(row);
}

function parseRow(el) {
  if(!isDead(el)) {
    el.indent = el.querySelector("img").width;
    el.replies = [];
    var next = el.nextSibling;
    while(next.querySelector("img").width > el.indent) {
      el.replies.push(next);
      next = next.nextSibling;
    }
    el.replyCount = el.replies.length;
    if(el.replyCount > 0) {
      collapsible(el);
    }
  }
}

function isDead(post) {
  return post.querySelector(".comment").innerHTML === "[flagged]";
}

function collapsible(el) {
  var collapseLink = createLink(el);
  el.HN_Collapse_Link = collapseLink;
  el.querySelector(".default").firstChild.appendChild(collapseLink);

  var hideNotification = createHideNotification(el);
  el.HN_Hide_Notification = hideNotification;
  var postFooter = el.querySelector("font[size='1']");
  postFooter.insertBefore(hideNotification, postFooter.firstChild);

  el.threadHide = false;
  collapseLink.addEventListener("click", toggleThread);
}

function createLink(post) {
  var el = d.createElement("span");
  el.className = "comhead";
  el.innerHTML = "| <a href=''>[-] Collapse</a>";
  el.HN_Post = post;
  return el;
}

function createHideNotification(post) {
  var el = d.createElement("p");
  el.style.display = "none";
  el.innerHTML = post.replyCount;
  if(post.replyCount == 1) {
    el.innerHTML += " reply hidden";
  } else {
    el.innerHTML += " replies hidden";
  }
  return el;
}

function toggleThread(e) {
  e.preventDefault();
  var el = this.HN_Post;
  el.threadHide = !el.threadHide;
  if(el.threadHide) {
    el.HN_Collapse_Link.innerHTML = "| <a href=''>[+] Expand</a>";
    hideThread(el);
  } else {
    el.HN_Collapse_Link.innerHTML = "| <a href=''>[-] Collapse</a>";
    showThread(el);
  }
}

function hideThread(el) {
  el.HN_Hide_Notification.style.display = "block";
  for(var i = 0; i < el.replies.length; i++) {
    var reply = el.replies[i];
    reply.style.display = "none";
  }
}

function showThread(el) {
  el.HN_Hide_Notification.style.display = "none";
  for(var i = 0; i < el.replies.length; i++) {
    var reply = el.replies[i];
    reply.style.display = "table-row";
  }
}
