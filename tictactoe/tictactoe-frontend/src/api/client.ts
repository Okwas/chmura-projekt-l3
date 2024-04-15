import io from "socket.io-client"

const url = window.location.origin
console.log("url", url)
export const socket = io(url, {
  path: "/socket.io/",
})
