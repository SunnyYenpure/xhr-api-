

var cl = console.log;

const postform = document.getElementById("postform");
const titlecontrol = document.getElementById("title");
const bodycontrol = document.getElementById("body");
const blogcontainer = document.getElementById("blogcontainer");
const useridcontrol = document.getElementById("userid");
const postsubmitbtn = document.getElementById("postsubmitbtn");
const postupdatebtn = document.getElementById("postupdatebtn");
const spinner = document.getElementById("spinner");

let base_url = "https://jsonplaceholder.typicode.com";
let post_url = `${base_url}/posts`;

// SweetAlert Toast function
const snackbar = (msg, icon = "success") => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: icon,
    title: msg,
    showConfirmButton: false,
    timer: 2000,
  });
};

// templating
const templating = (arr) => {
  let result = "";
  arr.forEach((blog) => {
    result += `
      <div class="col-md-4 mb-4">
        <div class="card h-100" id='${blog.id}'>
          <div class="card-header">
            <h2 class="m-0">${blog.title}</h2>
          </div>
          <div class="card-body">
            <p class="m-0">${blog.body}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary">Edit</button>
            <button onclick="onremove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
          </div>
        </div>
      </div>
    `;
  });
  blogcontainer.innerHTML = result;
};
// edit functionality
const onEdit = (ele) => {
  let Edit_id = ele.closest(".card").id;
  localStorage.setItem("Edit_id", Edit_id);
  let Edit_url = `${base_url}/posts/${Edit_id}`;
  spinner.classList.remove("d-none");

  let xhr = new XMLHttpRequest();
  xhr.open("GET", Edit_url);
  xhr.send();

  xhr.onload = function () {
    spinner.classList.add("d-none");
    if (xhr.status >= 200 && xhr.status <= 299) {
      let obj = JSON.parse(xhr.response);
      titlecontrol.value = obj.title;
      bodycontrol.value = obj.body;
      useridcontrol.value = obj.userId;

      postsubmitbtn.classList.add("d-none");
      postupdatebtn.classList.remove("d-none");
    } else {
      Swal.fire("Error!", "Unable to fetch post.", "error");
    }
  };
  xhr.onerror = function () {
    spinner.classList.add("d-none");
    Swal.fire("Network Error!", "Please check your connection.", "error");
  };
};

const fetchposts = () => {
  spinner.classList.remove("d-none");
  let xhr = new XMLHttpRequest();
  xhr.open("GET", post_url, true);
  xhr.send();
  xhr.onload = function () {
    spinner.classList.add("d-none");
    if (xhr.status >= 200 && xhr.status <= 299) {
      let data = JSON.parse(xhr.response).reverse();
      templating(data);
    } else {
      Swal.fire("Error!", "Failed to load posts.", "error");
    }
  };
  xhr.onerror = function () {
    spinner.classList.add("d-none");
    Swal.fire("Network Error!", "Please check your internet.", "error");
  };
};
fetchposts();

// CREATE
const onpostsubmit = (eve) => {
  spinner.classList.remove("d-none");
  eve.preventDefault();
  let postobj = {
    title: titlecontrol.value,
    body: bodycontrol.value,
    userId: useridcontrol.value,
  };

  let xhr = new XMLHttpRequest();
  xhr.open("POST", post_url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(postobj));

  xhr.onload = function () {
    spinner.classList.add("d-none");
    if (xhr.status >= 200 && xhr.status <= 299) {
      postform.reset();
      let res = JSON.parse(xhr.response);
      let col = document.createElement("div");
      col.classList.add("col-md-4", "mb-4");
      col.innerHTML = `
        <div class="card h-100" id='${res.id}'>
          <div class="card-header">
            <h2 class="m-0">${postobj.title}</h2>
          </div>
          <div class="card-body">
            <p class="m-0">${postobj.body}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary">Edit</button>
            <button onclick="onremove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
          </div>
        </div>
      `;
      blogcontainer.prepend(col);
      snackbar("Post added successfully!");
    } else {
      Swal.fire("Error!", "Unable to add post.", "error");
    }
  };
  xhr.onerror = function () {
    spinner.classList.add("d-none");
    Swal.fire("Network Error!", "Please try again.", "error");
  };
};

// UPDATE
const onupdate = () => {
  let update_id = localStorage.getItem("Edit_id");
  let update_url = `${base_url}/posts/${update_id}`;
  let update_obj = {
    title: titlecontrol.value,
    body: bodycontrol.value,
    userId: useridcontrol.value,
    id: update_id,
  };

  let xhr = new XMLHttpRequest();
  xhr.open("PATCH", update_url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(update_obj));

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status <= 299) {
      postform.reset();
      postsubmitbtn.classList.remove("d-none");
      postupdatebtn.classList.add("d-none");

      let card = document.getElementById(update_id).children;
      card[0].innerHTML = `<h2 class="m-0">${update_obj.title}</h2>`;
      card[1].innerHTML = `<p class="m-0">${update_obj.body}</p>`;
      snackbar("Post updated successfully!");
      localStorage.removeItem("Edit_id");
    } else {
      Swal.fire("Error!", "Failed to update post.", "error");
    }
  };
  xhr.onerror = function () {
    Swal.fire("Network Error!", "Could not update post.", "error");
  };
};

// DELETE
const onremove = (ele) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This post will be deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      spinner.classList.remove("d-none");
      let remove_id = ele.closest(".card").id;
      let remove_url = `${base_url}/posts/${remove_id}`;
      let xhr = new XMLHttpRequest();
      xhr.open("DELETE", remove_url);
      xhr.send();
      xhr.onload = function () {
        spinner.classList.add("d-none");
        if (xhr.status >= 200 && xhr.status <= 299) {
          ele.closest(".col-md-4").remove();
          Swal.fire("Deleted!", "Your post has been deleted.", "success");
        } else {
          Swal.fire("Error!", "Failed to delete post.", "error");
        }
      };
      xhr.onerror = function () {
        spinner.classList.add("d-none");
        Swal.fire("Network Error!", "Could not delete post.", "error");
      };
    }
  });
};

postform.addEventListener("submit", onpostsubmit);
postupdatebtn.addEventListener("click", onupdate);

// const postform = document.getElementById("postform");
// const titlecontrol = document.getElementById("title");
// const bodycontrol = document.getElementById("body");
// const blogcontainer = document.getElementById("blogcontainer");
// const useridcontrol = document.getElementById("userid");
// const postsubmitbtn = document.getElementById("postsubmitbtn");
// const postupdatebtn = document.getElementById("postupdatebtn");
// const spinner = document.getElementById("spinner");

// let base_url = "https://jsonplaceholder.typicode.com/";
// let post_url = `${base_url}/posts`;

// const snackbar=(msg,icon)=>{

// }

// // templating
// const templating = (arr) => {
//   let result = "";
//   arr.forEach((blog) => {
//     // cl(blog);
//     result += `
//                  <div class="col-md-4 mb-4" >
//                 <div class="card h-100" id='${blog.id}'>
//                     <div class="card-header">
//                         <h2 class="m-0">${blog.title}</h2>
//                     </div>

//                      <div class="card-body">
//                        <p class="m-0">${blog.body}</p>
//                     </div>

//                      <div class="card-footer d-flex justify-content-between">

//                         <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary"> Edit</button>

//                         <button onclick="onremove(this)" class="btn btn-sm btn-outline-danger"> Remove</button>
//                     </div>
//                 </div>
//             </div>

//         `;
//   });
//   blogcontainer.innerHTML = result;
// };

// const onEdit = (ele) => {
//   cl(ele);
//   let Edit_id = ele.closest(".card").id;
//   localStorage.setItem("Edit_id", Edit_id);

//   let Edit_url = `${base_url}/posts/${Edit_id}`;
//   spinner.classList.remove("d-none");
//   //api call

//   let xhr = new XMLHttpRequest();

//   xhr.open("GET", Edit_url);

//   xhr.send(null);

//   xhr.onload = function () {
//     spinner.classList.add("d-none");

//     if (xhr.status >= 200 && xhr.status <= 299) {
//       let obj = JSON.parse(xhr.response);
//       cl(obj);
//       (titlecontrol.value = obj.title),
//         (bodycontrol.value = obj.body),
//         // useridcontrol.value=obj.userid,
//         (useridcontrol.value = obj.userId);

//       postsubmitbtn.classList.add("d-none");
//       postupdatebtn.classList.remove("d-none");
//     } else {
//       cl("ERROR");
//     }
//   };
//   xhr.onerror = function () {
//     cl("NETWORK ERROR");
//     spinner.classList.add("d-none");
//   };
// };

// const fetchposts = () => {
//   spinner.classList.remove("d-none");

//   // step1:-xhr.instance
//   let xhr = new XMLHttpRequest();
//   // step-2 configure api
//   xhr.open("GET", post_url, true);

//   // step-3 send ddata
//   xhr.send();
//   // step-4 Requestonload
//   xhr.onload = function () {
//     spinner.classList.add("d-none");

//     // console.log(xhr);          //  XHR object
//     // console.log(xhr.status);   // HTTP status code
//     // console.log(xhr.response); // Response data
//     // templating :--
//     // api success to templating
//     // status
//     if (xhr.status >= 200 && xhr.status <= 299) {
//       //templating:
//       let data = JSON.parse(xhr.response); //array of post mela yaha..!!!!
//       cl(data);
//       templating(data);
//     } else {
//       console.error(xhr.status);
//       console.error(xhr.statusText);
//     }
//   };
//   xhr.onerror = function () {
//     cl("NETWORK ERROR");
//     spinner.classList.add("d-none");
//   };
// };
// fetchposts();

// //start post method post tasks:---

// const onpostsubmit = (eve) => {
//   spinner.classList.remove("d-none");

//   eve.preventDefault();
//   let postobj = {
//     title: titlecontrol.value,
//     body: bodycontrol.value,
//     userid: useridcontrol.value,
//   };
//   cl(postobj);

//   //   step1 create instaance
//   let xhr = new XMLHttpRequest();

//   // step-2 configuration
//   xhr.open("post", post_url);

//   xhr.send(JSON.stringify(postobj));

//   xhr.onload = function () {
//     if (xhr.status >= 200 && xhr.status <= 299) {
//       postform.reset(), cl(xhr.responseText);
//       let res = JSON.parse(xhr.response);
//       let col = document.createElement("div");
//       // col.classlist='col-md-4 mb-4'
//       col.classList.add("col-md-4", "mb-4");

//       col.innerHTML = `

//            <div class="card h-100" id='${res.id}'>
//                     <div class="card-header">
//                         <h2 class="m-0">${postobj.title}</h2>
//                     </div>

//                      <div class="card-body">
//                        <p class="m-0">${postobj.body}</p>
//                     </div>

//                      <div class="card-footer d-flex justify-content-between">

//                        <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary"> Edit</button>

//                         <button   onclick="onremove(this)" class="btn btn-sm btn-outline-danger"> Remove</button>
//                     </div>
//                 </div>

//         `;
//       blogcontainer.prepend(col);
//     } else {
//       cl("ERROR");
//     }
//     spinner.classList.add("d-none");
//   };
//   xhr.onerror = function () {
//     cl("NETWORK ERROR");
//     spinner.classList.add("d-none");
//   };
// };

// const onupdate = () => {
//   //get update id
//   let update_id = localStorage.getItem("Edit_id");
//   //get update url
//   let update_url = `${base_url}/posts/${update_id}`;

//   //get update object

//   let update_obj = {
//     title: titlecontrol.value,
//     body: bodycontrol.value,
//     userid: useridcontrol.value,
//     id: update_id,
//   };
//   cl(update_obj);
//   //api call
//   let xhr = new XMLHttpRequest();
//   xhr.open("PATCH", update_url);
//   xhr.send(JSON.stringify(update_obj));
//   xhr.onload = function () {
//     if (xhr.status >= 200 && xhr.status <= 299) {
//       let res = xhr.response;
//       postform.reset();
//       postsubmitbtn.classList.remove("d-none");
//       postupdatebtn.classList.add("d-none");

//       //select card

//       let card = document.getElementById(update_id).children;
//       card[0].innerHTML = `
//                         <h2 class="m-0">${update_obj.title}</h2>
//                   `;
//       card[1].innerHTML = `  <p class="m-0">${update_obj.body}</p>`;
//     } else {
//       cl("ERROR");
//     }
//   };
// };

// // remove functionality

// const onremove = (ele) => {
//   let getconfirm = confirm(
//     "Are you sure, you want to remove this post ...!!??"
//   );
//   if (getconfirm) {
//     spinner.classList.remove("d-none");

//     //remove id
//     let remove_id = ele.closest(".card").id;

//     //remove url
//     let remove_url = `${base_url}/posts/${remove_id}`;

//     //api call

//     let xhr = new XMLHttpRequest();

//     xhr.open("DELETE", remove_url);
//     xhr.send(null);
//     xhr.onload = function () {
//       spinner.classList.add("d-none");

//       if (xhr.status >= 200 && xhr.status <= 299) {
//         //remove card from ui

//         ele.closest(".col-md-4").remove();
//       } else {
//         cl("ERROR");
//       }
//     };
//     xhr.onerror = function () {
//       cl("NETWORK ERROR");
//       spinner.classList.add("d-none");
//     };

//     //remove card form ui
//   }
// };

// postform.addEventListener("submit", onpostsubmit);
// postupdatebtn.addEventListener("click", onupdate);
