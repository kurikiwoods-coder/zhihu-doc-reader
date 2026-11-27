function createReaderState() {
  let route = null;
  let open = false;
  return {
    get route() { return route; },
    get isOpen() { return open; },
    setRoute(next) {
      if (route?.key === next?.key) return false;
      route = next;
      open = false;
      return true;
    },
    enter() {
      if (!route || open) return false;
      open = true;
      return true;
    },
    exit() {
      open = false;
    },
  };
}
