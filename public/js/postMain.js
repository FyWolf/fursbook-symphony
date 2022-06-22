window.__isFetching = false;
window.__offset = 5;
let endContent = false;
const postsDiv = document.getElementById('postsDiv');
const el = document.querySelector(".endScroll")
let oppenedDD = ''

function likeButton(id) {
  const svg = document.getElementById(id);
  const likeCounter = document.getElementById('like'+id);
  if(svg.classList.contains('liked')) {
    $.post(
      window.location.pathname,
      {
        'id': id,
        'action': 'unlike',
      },
      function (response) {
        if(response.liked){
          svg.classList.remove("liked")
          likeCounter.innerText = response.likes;
        }
      },
    );

  }
  else {
    $.post(
      window.location.pathname,
      {
        'id': id,
        'action': 'like',
      },
      function (response) {
        if(response.liked){
          svg.classList.add("liked")
          likeCounter.innerText = response.likes;
        }
      },
    );
  }
}

function getmoredata() {
  window.__isFetching = true;
  $.post(
    window.location.pathname,
    {
      'offset': window.__offset,
      'action': 'scroll',
    },
    function (response) {
      if(response.postsList){
        $('#postsDiv').append(response.postsList);
        postsDiv.classList.remove("spinner");
        window.__isFetching = false;
      }
      else {
        postsDiv.classList.remove("spinner");
        window.__isFetching = false;
        endContent = true;
      }
    },
  );
 }

function isElementInViewport (el) {
  let rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function onVisibilityChange(el, callback) {
  let old_visible;
  return function () {
    let visible = isElementInViewport(el);
    if (visible != old_visible) {
      old_visible = visible;
      if (typeof callback == 'function') {
        callback();
      }
    }
  }
}

let handler = onVisibilityChange(el, function() {
  if(!window.__isFetching && !endContent) {
    getmoredata();
    postsDiv.classList.add("spinner");
    window.__offset += 5;
  }
});

function dropDownToggle(id) {
  const DD = document.getElementById("ddMenu" + id);
  if(oppenedDD && oppenedDD !== id) {
    const oppened = document.getElementById("ddMenu" + oppenedDD);
    oppened.classList.add("hidden");
    DD.classList.remove("hidden");
    oppenedDD = id;
  }
  else {
    if(DD.classList.contains("hidden")) {
      DD.classList.remove("hidden");
      oppenedDD = id;
    }
    else {
      DD.classList.add("hidden");
      oppenedDD = "";
    }
  }
}

function openReportedPost(id) {
  const hidder = document.getElementById("modalBackground");
  const modal = document.getElementById("modalDiv");
  const modalContent = document.getElementById("modalContent");
  let content = `
    <form onSubmit="return sendReport(${id})">
      <select name="reason" id="modalSelect">
      </select>
      <textarea id="modalDesc"></textarea>
      <button type="submit">Send</button>
    </form>
    <button onClick="closeModal()">cancel</button>
  `;
  modalContent.innerHTML = content;
  const select = document.getElementById("modalSelect");
  $.post(
    window.location.pathname,
    {
      'action': "getReportReason",
    },
    function (response) {
      response.reasonList.forEach(element => {
        let content = `
          <option value="${element.id}">${element.name}</option>
        `
        select.innerHTML += content;
      });
    },
  );
  hidder.classList.remove("hidden");
  modal.classList.remove("hidden");
}

function sendReport(id) {
  const select = document.getElementById("modalSelect");
  const desc = document.getElementById("modalDesc");
  $.post(
    window.location.pathname,
    {
      'action': "sendPostsReport",
      'postId': id,
      'reasonId': select.value,
      'description': desc.value,
    },
    function (response) {
    },
  );
  return false;
}

// jQuery
$(window).on('DOMContentLoaded load resize scroll', handler);