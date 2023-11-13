export const getMusicStatus = () =>  {
    return localStorage.getItem('enableMusic') === '1' ? true : false
} 