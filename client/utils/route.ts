export function routeIsActive(pathname: string, item: NavigationItem): boolean {
  if (item.checkActive) {
    return item.checkActive(pathname, item);
  }

  return item?.exact
    ? pathname === item?.href
    : item?.href
    ? pathname.indexOf(item.href) === 0
    : false;
}
