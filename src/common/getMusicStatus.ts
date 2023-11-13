export const getMusicStatus = () =>  {
    const musicStatus = localStorage.getItem('enableMusic')
    return musicStatus === '1' || musicStatus === null ? true : false
} 