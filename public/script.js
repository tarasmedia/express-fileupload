
Dropzone.options.testDropzone = {
  dictDefaultMessage: "Перетащите файлы для загрузки", // было на англ
  maxFilesize: 2, // MB
};

const uploadButton = document.getElementById('uploadButton');

uploadButton.addEventListener('click', async (event) => {
  const uploadInput = document.getElementById('uploadInput');
  const files = uploadInput.files[0];

  const formData = new FormData();
  formData.append('file', uploadInput.files[0]);

  const fetchOptions = {
    method: 'POST',
    body: formData,
    files: files
  };

  try {
    const post = await fetch('/upload', fetchOptions);
    const postResult = await post.json();
    iziToast.show({
      title: 'Готово!',
      message: postResult,
      position: 'topRight',
      color: 'green',
  });
  } catch (error) {
    console.log(error);
  }
});