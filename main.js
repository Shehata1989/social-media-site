// modal
let currentEditPostId = null;

const handelModal = (type, dataPostString = null) => {
  const modalLogin = document.getElementById("modal-Login");
  const modalRegister = document.getElementById("modal-Register");
  const modalCreatePost = document.getElementById("modal-create-post");
  const modalDelete = document.getElementById("modal-delete");
  const moadelPostTitle = document.getElementById("modal-post-title");
  const moadelPostBtn = document.getElementById("handel-post-btn");
  const tiltleCreatePost = document.getElementById("title-create-post");
  const bodyCreatePost = document.getElementById("body-create-post");
  const imageCreatePost = document.getElementById("image-create-post");

  if (type === "login" && modalLogin) {
    modalLogin.classList.remove("hidden");
  } else if (type === "register" && modalRegister) {
    modalRegister.classList.remove("hidden");
  } else if (
    type === "create-post" &&
    window.location.pathname.includes("home.html") &&
    modalCreatePost &&
    moadelPostTitle &&
    moadelPostBtn &&
    tiltleCreatePost &&
    bodyCreatePost &&
    imageCreatePost
  ) {
    moadelPostTitle.innerText = "Create Post";
    moadelPostBtn.innerText = "Create Post";

    tiltleCreatePost.value = "";
    bodyCreatePost.value = "";
    imageCreatePost.value = null;
    currentEditPostId = null;
    modalCreatePost.classList.remove("hidden");
  } else if (
    type === "Edit Post" &&
    modalCreatePost &&
    moadelPostTitle &&
    moadelPostBtn &&
    tiltleCreatePost &&
    bodyCreatePost
  ) {
    moadelPostTitle.innerText = "Edit Post";
    moadelPostBtn.innerText = "Edit Post";

    const dataPost = dataPostString
      ? JSON.parse(decodeURIComponent(dataPostString))
      : null;

    if (!dataPost) return;

    currentEditPostId = dataPost.id;
    tiltleCreatePost.value = dataPost.title;
    bodyCreatePost.value = dataPost.body;

    modalCreatePost.classList.remove("hidden");
  } else if (type === "Delete Post" && modalDelete) {
    const postId = dataPostString;

    if (!postId) return;

    currentEditPostId = postId;

    modalDelete.classList.remove("hidden");
  } else {
    if (modalLogin) modalLogin.classList.add("hidden");
    if (modalRegister) modalRegister.classList.add("hidden");
    if (modalCreatePost) modalCreatePost.classList.add("hidden");
    if (modalDelete) modalDelete.classList.add("hidden");
  }

  document.addEventListener("click", (e) => {
    if (e.target === modalLogin && modalLogin)
      modalLogin.classList.add("hidden");
    if (e.target === modalRegister && modalRegister)
      modalRegister.classList.add("hidden");
    if (e.target === modalCreatePost && modalCreatePost)
      modalCreatePost.classList.add("hidden");
    if (e.target === modalDelete && modalDelete)
      modalDelete.classList.add("hidden");
  });
};

let page = 1;
let lastPage = null;
let isLoading = false;

const handleScroll = () => {
  if (isLoading || (lastPage && page >= lastPage)) return;

  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomPosition = document.body.offsetHeight - 500;

  if (scrollPosition + 1000 >= bottomPosition) {
    isLoading = true;
    page++;
    getPosts(false, page);
  }
};

let isThrottled = false;
const throttleDelay = 200;

window.addEventListener("scroll", () => {
  if (!isThrottled) {
    handleScroll();
    isThrottled = true;
    setTimeout(() => {
      isThrottled = false;
    }, throttleDelay);
  }
});

// Get Posts
const baseUrl = "https://tarmeezacademy.com/api/v1";
const getPosts = (reload = true, pageNum = 1) => {
  if (!window.location.pathname.includes("home.html")) {
    return;
  }

  const postsContainer = document.getElementById("posts-container");

  if (reload && postsContainer != null) {
    postsContainer.innerHTML = "Loading...";
  }

  axios
    .get(`${baseUrl}/posts?limit=5&page=${pageNum}`)
    .then((res) => {
      lastPage = res.data.meta.last_page;
      if (reload && postsContainer != null) {
        postsContainer.innerHTML = "";
      }
      const posts = res.data.data;
      isLoading = false; // Reset loading state after successful fetch

      const currentUser = JSON.parse(localStorage.getItem("user"));

      for (const post of posts) {
        const content = `
            <div
            class="flex flex-col gap-4 post p-4 rounded"
          >
            <!-- @user info -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <div class="w-12 h-12 rounded-full overflow-hidden border">
                  <img src="${
                    post?.author?.profile_image
                  }" alt="profile-image" />
                </div>
                <div class="flex flex-col justify-start">
                  <h2 class="font-bold text-gray-800">${
                    post?.author?.username
                  }</h2>
                  <span class="text-gray-600">${post?.created_at} </span>
                </div>
              </div>
              <div>
                  ${
                    currentUser && currentUser.id === post.author.id
                      ? `
              <button onclick="handelModal('Edit Post','${encodeURIComponent(
                JSON.stringify(post)
              )}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer">Edit</button>
              <button onclick="handelModal('Delete Post', '${
                post.id
              }')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer">Remove</button>
              `
                      : ""
                  }
              </div>
            </div>
            <!-- @post image -->
            <div onclick="handelPostDetails(${
              post?.id
            })" class="w-full h-96 overflow-hidden cursor-pointer">
              <img
                class="w-full h-full object-contain"
                src="${post?.image}"
                alt="post-image"
              />
            </div>
            <!-- @post title -->
            <p class="text-gray-600">${post?.title}</p>
            <!-- @post content -->
            <p class="text-gray-600">${post?.body}</p>
            <hr class="border-gray-300" />
            <!-- @post actions -->
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${
                post?.comments_count
              } comments</span>
              <span
                id="tags-${post.id}"
                class="flex items-center justify-start gap-2 text-gray-600 rounded"
              >
              </span>
            </div>
          </div>
  `;
        postsContainer.innerHTML += content;
        const tagElement = document.getElementById(`tags-${post.id}`);
        for (tag of post.tags) {
          tagElement.innerHTML += `<span class="bg-gray-300 p-2 rounded">${tag}</span>`;
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// Handel Register
const handelRegister = (e) => {
  e.preventDefault();
  const userName = document.getElementById("username-register").value;
  const name = document.getElementById("name-register").value;
  const email = document.getElementById("email-register").value;
  const password = document.getElementById("password-register").value;
  const image = document.getElementById("image-register").files[0];

  const formData = new FormData();
  formData.append("username", userName);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("image", image);

  const modalRegisterBtn = document.getElementById("modal-register-btn");
  modalRegisterBtn.innerText = `Loading...`;

  axios
    .post(`${baseUrl}/register`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      localStorage.setItem("token", res.data.token);
      handelModal("close");
      handelAlertToast("Register Successfully", "success");
      setupUI();
      window.location.href = "/home.html";
    })
    .catch((err) => {
      handelModal("close");
      handelAlertToast(
        err.response.data.errors.email +
          " " +
          err.response.data.errors.username,
        "error"
      );
    })
    .finally(() => {
      modalRegisterBtn.innerText = `Register`;
    });
};

// Handel Login
const handelLogin = (e) => {
  e.preventDefault();
  const userName = document.getElementById("username-login").value;
  const password = document.getElementById("password-login").value;
  const modalLoginBtn = document.getElementById("modal-login-btn");
  modalLoginBtn.innerText = `Loading...`;
  axios
    .post(
      `${baseUrl}/login`,
      {
        username: userName,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      handelModal("close");
      setupUI();
      handelAlertToast("Login Successfully");
      window.location.reload();
    })
    .catch((err) => {
      handelModal("close");
      handelAlertToast(err.response.data.message, "error");
    })
    .finally(() => {
      modalLoginBtn.innerText = `Login`;
    });
};

// Handel Logout
const handelLogout = () => {
  const logoutBtn = document.querySelector("#logout-btn");
  logoutBtn.innerText = `Loading...`;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
  handelAlertToast("Logout Successfully");
  window.location.href = "/home.html";
};

const handelCreateEditPost = (e) => {
  if (
    !window.location.pathname.includes("home.html") &&
    !window.location.pathname.includes("profile.html") &&
    !window.location.pathname.includes("postDetails.html")
  ) {
    return;
  }
  e.preventDefault();
  const title = document.getElementById("title-create-post").value;
  const body = document.getElementById("body-create-post").value;
  const image = document.getElementById("image-create-post").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  currentEditPostId ? formData.append("_method", "put") : null;
  if (image) formData.append("image", image);

  const createPostBtn = document.getElementById("handel-post-btn");

  const url = currentEditPostId
    ? `${baseUrl}/posts/${currentEditPostId}`
    : `${baseUrl}/posts`;

  createPostBtn.innerText = currentEditPostId ? "Updating..." : "Creating...";

  axios
    .post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then(() => {
      const message = currentEditPostId
        ? "Post Updated Successfully"
        : "Post Created Successfully";
      handelAlertToast(message);

      // Reset form and state
      document.getElementById("create-post-form")?.reset();
      window.location.reload();
      handelModal("close");
    })
    .catch((err) => {
      const errorMessage = err.response?.data?.message || "An error occurred";
      handelAlertToast(errorMessage, "error");
    })
    .finally(() => {
      createPostBtn.innerText = currentEditPostId
        ? "Update Post"
        : "Create A New Post";
    });
};

const handelDeletePost = (e) => {
  e.preventDefault();
  let id = currentEditPostId;
  axios
    .delete(`${baseUrl}/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then(() => {
      if (window.location.pathname.includes("postDetails.html")) {
        window.location.href = "home.html";
      } else {
        window.location.reload();
      }
      handelAlertToast("Post Deleted Successfully");
      handelModal("close");
    })
    .catch((err) => {
      handelAlertToast(err.response.data.message, "error");
    });
};

// Setup UI
const setupUI = () => {
  const authBtn = document.getElementById("auth-btn");
  const createPostBtn = document.getElementById("create-post-modal");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (localStorage.getItem("token") && currentUser) {
    authBtn.innerHTML = `
    <img class="w-12 h-12 rounded-full overflow-hidden border object-cover" src="${currentUser.profile_image}" alt="profile-image" />
    <span class="font-bold text-white">${currentUser.username}</span>
    <button id="logout-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer" onclick="handelLogout()">Logout</button>
    `;
    if (createPostBtn !== null) {
      createPostBtn.style.display = "block";
    }
  } else {
    authBtn.innerHTML = `<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer" onclick="handelModal('login')">Login</button>
    <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer" onclick="handelModal('register')">Register</button>`;
    if (createPostBtn !== null) {
      createPostBtn.style.display = "none";
    }
  }
};

const handelAlertToast = (mass, type = "success") => {
  const alertToast = document.getElementById("alert-toast");
  const alertToastText = document.getElementById("alert-toast-text");

  if (type === "success") {
    alertToast.classList.remove("bg-red-200");
    alertToast.classList.add("bg-green-200");
    alertToastText.classList.remove("text-red-800");
    alertToastText.classList.add("text-green-800");
  } else {
    alertToast.classList.remove("bg-green-200");
    alertToast.classList.add("bg-red-200");
    alertToastText.classList.remove("text-green-800");
    alertToastText.classList.add("text-red-800");
  }

  alertToastText.innerText = mass;
  alertToast.classList.remove("opacity-0");

  setTimeout(() => {
    alertToast.classList.add("opacity-0");
  }, 3000);
};

const handelPostDetails = (id) => {
  window.location.href = `postDetails.html?id=${id}`;
};

const getPostDetails = () => {
  if (!window.location.pathname.includes("postDetails.html")) {
    return;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const postId = searchParams.get("id");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  axios
    .get(`${baseUrl}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      const post = res.data.data;
      const postContainer = document.getElementById("posts-container");
      postContainer.innerHTML = "";
      const contentPost = `
    <div class="flex flex-col gap-4 post p-4 rounded">
      <!-- @user info -->
      <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
        <div class="w-12 h-12 rounded-full overflow-hidden border">
          <img src="${post?.author?.profile_image}" alt="profile-image" />
        </div>
        <div class="flex flex-col justify-start">
          <h2 class="font-bold text-gray-800">${post?.author?.username}</h2>
          <span class="text-gray-600">${post?.created_at} </span>
        </div>
      </div>
      <div>
          ${
            currentUser && currentUser.id === post.author.id
              ? `
              <button onclick="handelModal('Edit Post','${encodeURIComponent(
                JSON.stringify(post)
              )}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer">Edit</button>
              <button onclick="handelModal('Delete Post', '${
                post.id
              }')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer">Remove</button>
              `
              : ""
          }
      </div>
      </div>
      <!-- @post image -->
      <div class="w-full h-96 overflow-hidden">
        <img
          class="w-full h-full object-contain"
          src="${post?.image}"
          alt="post-image"
        />
      </div>
      <!-- @post title -->
      <p class="text-gray-600">${post?.title}</p>
      <!-- @post content -->
      <p class="text-gray-600">${post?.body}</p>
      <hr class="border-gray-300" />
      <!-- @post actions -->
      <div class="flex justify-between items-center">
        <span class="text-gray-600">${post?.comments_count} comments</span>
        <span id="tags-${
          post.id
        }" class="flex items-center justify-start gap-2 text-gray-600 rounded">
        </span>
      </div>
    </div>
`;
      postContainer.innerHTML += contentPost;
      const tagElement = document.getElementById(`tags-${post.id}`);
      for (tag of post.tags) {
        tagElement.innerHTML += `<span class="bg-gray-300 p-2 rounded">${tag}</span>`;
      }

      for (comment of post.comments) {
        postContainer.innerHTML += `
          <div class="flex items-center gap-4 p-1">
            <div class="w-full flex justify-start gap-2 bg-white p-3 rounded">
              <div class="w-12 h-12 rounded-full overflow-hidden border">
                <img src="${
                  comment?.author?.profile_image
                }" alt="profile-image" />
              </div>
              <div class="flex flex-col gap-1">
                <h2 class="font-bold text-gray-800">
                  ${comment?.author?.username}
                </h2>
                <span class="text-gray-600">
                  ${comment?.author?.created_at.split("T")[0]}
                </span>
                <p class="text-gray-600">
                  ${comment?.body}
                </p>
              </div>
            </div>
          </div>

        `;
      }
      if (localStorage.getItem("token")) {
        postContainer.innerHTML += `
            <div class="flex items-center gap-4 p-1">
            <input  placeholder="Add Comment" class="bg-white w-full px-3 py-2 border border-gray-300 rounded outline-none" type="text" name="comment" id="comment">
                <button onclick="handelComment()" id="comment-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">Comment</button>
            </div>
        `;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const handelComment = () => {
  const postId = new URLSearchParams(window.location.search).get("id");
  const comment = document.getElementById("comment").value;
  const params = {
    body: comment,
  };
  axios
    .post(`${baseUrl}/posts/${postId}/comments`, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then(() => {
      getPostDetails();
    })
    .catch((err) => {
      console.log(err);
    });
};

const handelUserProfile = () => {
  return new Promise((resolve, reject) => {
    if (!window.location.pathname.includes("profile.html")) {
      return resolve();
    }
    if (
      (!window.location.href.includes("profile.html") &&
        !localStorage.getItem("token")) ||
      !localStorage.getItem("user")
    ) {
      return reject("User Not Found");
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));
    // User Profile Info
    axios
      .get(`${baseUrl}/users/${currentUser.id}`)
      .then((res) => {
        const user = res.data.data;
        const ProfileInfo = document.getElementById("profile-info");
        const contentProfile = `
              <div class="flex items-center justify-between gap-4 bg-gray-200 py-8 px-14 rounded">
                <div class="flex items-center gap-2">
                <img
                id="profile-img"
                class="w-12 h-12 rounded-full overflow-hidden border object-cover"
                src=${user.profile_image}
                alt=""
                />
                <h2 id="username-profile" class="font-bold text-gray-800">${user.username}</h2>
              </div>
              <div class="flex flex-col items-center">
                <h2 class="font-bold text-gray-800">Count Posts</h2>
                <p id="count-posts-number">${user.posts_count}</p>
              </div>
              <div class="flex flex-col items-center">
                <h2 class="font-bold text-gray-800">Count Comments</h2>
                <p id="count-comments-number">${user.comments_count}</p>
              </div>
              </div>
      `;

        ProfileInfo.innerHTML = contentProfile;
        document.getElementById("profile-img").src = user.profile_image;
        document.getElementById("username-profile").innerText = user.username;
        document.getElementById("count-posts-number").innerText =
          user.posts_count;
        document.getElementById("count-comments-number").innerText =
          user.comments_count;
        resolve(user);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const getPostsUser = () => {
  if (!window.location.pathname.includes("profile.html")) {
    return;
  }
  const currentUser = JSON.parse(localStorage.getItem("user"));
  axios
    .get(`${baseUrl}/users/${currentUser.id}/posts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((res) => {
      const posts = res.data.data;
      const postsContainer = document.getElementById("posts-container");
      postsContainer.innerHTML = "";
      for (const post of posts) {
        const content = `
        <div
            class="flex flex-col gap-4 post p-4 rounded"
          >
            <!-- @user info -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <div class="w-12 h-12 rounded-full overflow-hidden border">
                  <img src="${
                    post?.author?.profile_image
                  }" alt="profile-image" />
                </div>
                <div class="flex flex-col justify-start">
                  <h2 class="font-bold text-gray-800">${
                    post?.author?.username
                  }</h2>
                  <span class="text-gray-600">${post?.created_at} </span>
                </div>
              </div>
              <div>
                  ${
                    currentUser && currentUser.id === post.author.id
                      ? `
              <button onclick="handelModal('Edit Post', '${encodeURIComponent(
                JSON.stringify(post)
              )}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer">Edit</button>
              <button onclick="handelModal('Delete Post', '${
                post.id
              }')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold hover:text-gray-200 cursor-pointer">Remove</button>
              `
                      : ""
                  }
              </div>
            </div>
            <!-- @post image -->
            <div onclick="handelPostDetails(${
              post?.id
            })" class="w-full h-96 overflow-hidden cursor-pointer">
              <img
                class="w-full h-full object-contain"
                src="${post?.image}"
                alt="post-image"
              />
            </div>
            <!-- @post title -->
            <p class="text-gray-600">${post?.title}</p>
            <!-- @post content -->
            <p class="text-gray-600">${post?.body}</p>
            <hr class="border-gray-300" />
            <!-- @post actions -->
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${
                post?.comments_count
              } comments</span>
              <span
                id="tags-${post.id}"
                class="flex items-center justify-start gap-2 text-gray-600 rounded"
              >
              </span>
            </div>
          </div>
      `;
        postsContainer.innerHTML += content;
      }
    });
};

setupUI();
getPosts();
getPostDetails();
handelUserProfile()
  .then(() => getPostsUser())
  .catch((err) => console.log(err));
