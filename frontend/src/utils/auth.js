export function isUserLoggedIn() {
  const token = localStorage.getItem('authToken')
  
  return !!token
}

export const getTokenUrl = () => {
  return window.location.pathname.split('/').at(-1)
}
