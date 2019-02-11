function login() {
    let username = document.querySelector("#username").value;
    let password = document.querySelector("#password").value;
    let root = location.origin;
    fetch(`${root}/portal/login?username=${username}&password=${password}&key=2596ccc0-09d5-4b73-bebc-4107ee0c8f6e`).then(res => res.json()).then(gotLoginResponse);
}

function gotLoginResponse(data) {
    if (data.msg == 'login-in') {
        alert('Login success');
        localStorage.setItem('admin', 'true');
        localStorage.setItem('key', data.adminAuth);
        location.href = location.origin + '/portal/portal.html';
    }
    else {
        alert('Invalid login credentials');
    }
}