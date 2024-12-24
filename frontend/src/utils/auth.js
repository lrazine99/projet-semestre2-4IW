export const getTokenUrl = () => {
  return window.location.pathname.split('/').at(-1)
}
