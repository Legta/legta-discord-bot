
(async () => {
    const request = await fetch("https://api.mcsrvstat.us/3/minecraft.hermahs.com")
    const jsonRequest = await request.json()
    console.log(jsonRequest)
})()