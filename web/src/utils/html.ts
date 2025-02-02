const email = document.createElement('input');
email.type = 'email';
email.placeholder = 'Email';
email.classList.add('w-[26%]', 'p-2', 'rounded-md', 'border', 'border-battleship-grey/[.4]', 'absolute', 'top-1/2', 'mt-10', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'bg-transparent', 'placeholder-battleship-grey', 'text-battleship-grey');

const password = document.createElement('input');
password.type = 'password';
password.placeholder = 'Password';
password.classList.add('w-[26%]', 'p-2', 'rounded-md', 'border', 'border-battleship-grey/[.4]', 'absolute', 'top-1/2', 'mt-[90px]', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'bg-transparent', 'placeholder-battleship-grey', 'text-battleship-grey');

const login = document.createElement('button');
login.innerHTML = 'Login';
login.classList.add('w-[26%]', 'p-2', 'rounded-md', 'border', 'border-battleship-grey/[.4]', 'absolute', 'top-1/2', 'mt-[180px]', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'bg-battleship-grey', 'text-smoky-black', 'font-bold', 'uppercase');

const div = document.createElement('div');
div.classList.add('absolute', 'w-[26%]', 'top-1/2', 'mt-[230px]', 'md:mt-[220px]', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'text-battleship-grey', 'flex', 'justify-between', 'flex-col', 'md:flex-row');

const register = document.createElement('button');
register.innerHTML = 'Register';
register.classList.add();
div.appendChild(register);

const forgot = document.createElement('button');
forgot.innerHTML = 'Forgot password?';
div.appendChild(forgot);

const error = document.createElement('p');
error.innerHTML = 'Invalid email or password';
error.classList.add('absolute', 'top-1/2', 'mt-[133px]', 'w-[490px]', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'text-red-400');

export {
    email,
    password,
    login,
    div,
    error,
    register,
    forgot
}