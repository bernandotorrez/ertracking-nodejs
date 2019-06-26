login_time = () => {
    var date = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
                              "July", "August", "September", "October", "November", "December"
                              ];
    var day = date.getDate(),
        month = monthNames[date.getMonth()],
        year = date.getFullYear(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();

        var login_time = `${day} ${month} ${year} ${hour}:${minute}:${second}`
                              
        return login_time
}

cek_level = (level) => {
    
    if(level=='Headquarter') return 'headquarter'
    else if(level=='Cabang') return 'branch'
    else return 'admin'
    
}

login_time_his = () => {
    var date = new Date();

    var day = date.getDate(),
        month = date.getMonth()+1,
        year = date.getFullYear(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();

        var login_time_his = `${year}-${month}-${day} ${hour}:${minute}:${second}`
                              
        return login_time_his
}

capital_each_word = (letter) => {
    let callback = letter.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

    return callback
}

module.exports = {
    login_time: login_time,
    login_time_his: login_time_his,
    cek_level: cek_level,
    capital_each_word: capital_each_word
}