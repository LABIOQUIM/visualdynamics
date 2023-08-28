export interface SendMailDTO {
  from: string;
  to: string;
  subject: string;
  context: {
    base_url: string;
    preheader: string;
    content: string;
    showButton: boolean;
    buttonLink: string;
    buttonText: string;
    showPostButtonText: boolean;
    postButtonText: string;
    email: string;
  };
}
