import io from 'socket.io-client'

const url = import.meta.env.VITE_SOCKET_SERVER_URL.toString()
console.log('url', url)
export const socket = io(url)



