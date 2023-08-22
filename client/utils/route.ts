export function routeIsActive(pathname: string, item: NavigationItem): boolean {
  if (item.checkActive) {
    return item.checkActive(pathname, item);
  }

  console.log(pathname);

  return item?.exact
    ? pathname.substring(6) === `${item?.href !== "/" ? item?.href : ""}`
    : item?.href
    ? pathname
        .substring(6)
        .indexOf(`${item?.href !== "/" ? item?.href : ""}`) === 0
    : false;
}
