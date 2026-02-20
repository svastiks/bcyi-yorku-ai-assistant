export function getIconPath(iconName: string, isDark: boolean): string {
  const folder = isDark ? '/icons/darkModeIcons' : '/icons'
  return `${folder}/${iconName}.png`
}