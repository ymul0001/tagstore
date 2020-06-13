const signoutButton = document.getElementById("signout-button");
const pictures = document.querySelector(".picDiv");
const upload = document.querySelector(".imgupload");
let card;
let name;

//signout event listeners
signoutButton.addEventListener('click', (e) => {
  e.preventDefault();
  var poolData = {
          UserPoolId: "us-east-1_hnsrBJV2h", // Your user pool id here
          ClientId: "7t77m8pqo5k160jeko8416nou1" // Your client id here
      };
        
    //parse the normal poolData object as AWSCognito object
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  var userData = {
      Username: localStorage.getItem("username"),
      Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData); 
  cognitoUser.signOut();
  localStorage.clear();
  window.location.href = '../index.html';
})

//upload picture function
const uploadImage = async (e) => {
  const file = e.target.files[0];
  console.log(file);
  if (file && file.type !== "image/jpeg" && file.type !== "image/png") {
    alert("Only Jpeg and Png images are allowed");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadstart = () => {};
      reader.onloadend = (event) => {
        const base64Url = event.target.result;
        if (base64Url) {
          upload.innerHTML = `
          <img
                  src=${base64Url.toString()}
                  style="width: 150px; height: 150px; border-radius: 50%;"
                  alt=""
                  class="rounded-circle"
                />
          `;
        }
      };
    } else {
      alert("File could not be uploaded");
    }
  }
};
document.querySelector(".uploadfile").addEventListener("change", uploadImage);

//
const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

async function save() {
  var file = document.getElementById('FileId').files[0];
  var fileName = file.name;
  var filebase64 = await toBase64(file);
  var filebas64Data = filebase64.split(',')[1]
  const token =  `${localStorage.getItem("token")}`;
  console.log(token);
  sendData = {
    "filename": fileName,
    "body": filebas64Data
  };
  fetch("https://8jfhfumcs1.execute-api.us-east-1.amazonaws.com/prod/imageupload", {
    method: 'POST',
    headers: {
      'Authorization': token,
    },
    body: JSON.stringify(sendData),
    mode: 'cors',
  })
  .then((response) => response.text())
  .then(result => {
    alert("image has been successfully added!");
    $('#exampleModal').modal('hide');
  })
  .catch((err) => {
    console.log('Error: ', err);
  })
  // window.location.reload();
};

document.querySelector(".save").addEventListener("click", save);

window.addEventListener("load", function (event) {
    card = document.getElementById("pic");
    name = card.getElementsByTagName("div");

    //test the jwt token on load
    console.log(localStorage.getItem("token"));

    //check if token is not in the local storage, will be redirected to the login page
});

//search function
const search = async () => {
  let input = document.querySelector(".picSearch");
  let filter = input.value;
  let queryString = filter.split(",");
  let counter = 1;
  let stringTag = "";
  for (i = 0; i < queryString.length; i++){
    let parameters = `tag${counter}=`;
    if (i === queryString.length-1)
    {
      stringTag = stringTag + parameters + queryString[i];
      counter++; 
    }
    else{
      stringTag = stringTag + parameters + queryString[i] + "&";
      counter++;
    }
    
  }
  console.log(stringTag);
  const token =  `${localStorage.getItem("token")}`;
  await fetch(`https://kvzce07oce.execute-api.us-east-1.amazonaws.com/prod/QueryHandler?${stringTag}`, {
    method: 'GET',
    headers: {
      'Authorization': token,
    },
    mode: 'cors',
  })
  .then((response) => response.json())
  .then(result => {
    if(result.links.length>0)
    {
      let linksUrl = '';
      result.links.forEach((link)=>{
        linksUrl += `<div class="result" style="margin-top: 2rem; width: 90%; margin:2rem auto; display:flex; background-color:#e0d0a4;
        border-radius:5px; justify-content:space-between;"><p style="padding-top:7rem; padding-left:1rem; font-size:1rem;"><a href="${link}" target="_blank">${link}</a></p>
        <div class="result-image" style="padding:1.5rem 1rem;"><img src="${link}" width="230" height="230"/></div></div>`;
      });
      $('#pic').html(linksUrl);
    }
    console.log(result);
  })
  .catch((err) => {
    console.log('Error: ', err);
  })
};



// window.location.reload();



document.querySelector(".picSearch").addEventListener("keyup", search);
