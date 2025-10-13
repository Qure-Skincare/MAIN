const loadAsyncSection = (section) => {
    const container = document.getElementById("async-section");

    if (!container) {
        console.error('Container with id="async-section" not found.');
        return;
    }

    const templateId = container.getAttribute('data-async-template-id');
    const sectionId = `${templateId}__${section}`;

    const pageUrl = window.location.pathname;

    fetch(`${pageUrl}?sections=${sectionId}`)
        .then(res => res.json())
        .then(data => {
            if (data[sectionId]) {
                let html = data[sectionId].trim();

                const tempWrap = document.createElement('div');
                tempWrap.innerHTML = html;

                const tpl = tempWrap.querySelector('template#async');
                
                if (tpl) {
                    html = tpl.innerHTML.trim();
                }

                container.innerHTML = html;

                container.querySelectorAll("script").forEach(oldScript => {
                    const newScript = document.createElement("script");

                    [...oldScript.attributes].forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });

                    if (!oldScript.src) {
                        newScript.textContent = oldScript.textContent;
                    }

                    oldScript.replaceWith(newScript);
                });
            } else {
                console.error('Section not found in response:', sectionId);
            }
        })
        .catch(err => console.error(err));
};

const element = document.querySelector('.qure__faucet-button');
if (element) {
    loadAsyncSection(element.id);
}

document.querySelectorAll('.qure__faucet-button').forEach(function(element) {
    element.addEventListener('click', function() {
        loadAsyncSection(this.id);
    });
});
