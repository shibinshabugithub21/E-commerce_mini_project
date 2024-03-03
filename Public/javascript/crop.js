let fileInputs = document.querySelectorAll('[data-image-preview]')


let croppingBox = document.querySelector('.cropper110-cropping-box'),
    crop = document.querySelector('.cropper110-crop'),
    cropper = '',
    currentInput = null,
    imgNames = null,
    imgSrc = null;

fileInputs.forEach(fileInput => {
    fileInput.addEventListener('change', () => {
        let previewDiv = document.querySelector(fileInput.dataset.imagePreview)
        previewDiv.innerHTML = ""
        for (let each of fileInput.files) {
            let imgSrc = URL.createObjectURL(each)
            let img = document.createElement('img')
            img.src = imgSrc
            img.dataset.fileName = each.name
            img.dataset.input = fileInput.id
            img.addEventListener('click', cropImage)

            previewDiv.append(img)

        }
    })
})


function cropImage(e) {
    
    document.getElementById('cropper110Modal').style.display = 'flex'

    let img = document.createElement('img');
    img.id = 'image';
    img.src = e.target.src;
    croppingBox.innerHTML = '';
    croppingBox.appendChild(img);
    cropper = new Cropper(img);

    imgNames = e.target.dataset.fileName
    currentInput = e.target.dataset.input

}



//crop and save on click
crop.addEventListener('click', e => {
    e.preventDefault();
    // get result to data uri

    let imgSrc = cropper.getCroppedCanvas({
        width: 300 // input value
    }).toDataURL();

    if (imgSrc && imgNames !== null) {
        let fileUploader = document.getElementById(currentInput)
        fetch(imgSrc)
            .then(res => res.blob())
            .then(blob => {
                let file = new File([blob], `${imgNames}-${Date.now()}.png`, { type: "image/jpeg" })

                const dt = new DataTransfer()
                for (let each of fileUploader.files) {
                    if (each.name !== imgNames) {
                        dt.items.add(each)
                    } else {
                        dt.items.add(file)
                    }
                }


                fileUploader.files = dt.files


                let previewDiv = document.querySelector(fileUploader.dataset.imagePreview)
                previewDiv.innerHTML = ""
                let res = ""

                for (let each of fileUploader.files) {
                    let src = URL.createObjectURL(each)
                    res += `<img src="${src}" data-file-name="${each.name}" data-input="${fileUploader.id}" onclick="cropImage(event)" class="previewImages">`
                }

                previewDiv.innerHTML = res


            })
    }

    document.querySelector('.cropper110-close').click()
});

document.querySelector('.cropper110-close')
    .addEventListener('click', () => {
        document.getElementById('cropper110Modal').style.display = 'none'
    })