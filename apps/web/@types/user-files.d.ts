interface FileProps {
  path: string;
  name: string;
  children?: FileProps[];
}
