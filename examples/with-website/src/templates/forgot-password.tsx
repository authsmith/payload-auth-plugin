import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  render,
  Section,
  Text,
} from '@react-email/components'

type Props = { verificationCode: string }

export const ForgotPasswordTemplate = ({ verificationCode }: Props) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Verify your account to restore your password</Preview>
      <Container style={container}>
        <Img
          src={'https://avatars.githubusercontent.com/u/193026825?s=280&v=4'}
          width="42"
          height="42"
          alt="AuthSmith"
          style={logo}
        />
        <Heading style={heading}>Your verification link</Heading>
        <Section style={buttonContainer}>
          <Button
            style={button}
            href={`http://localhost:3000/auth/restore-password?restore_code=${verificationCode}`}
          >
            Verify
          </Button>
        </Section>
        <Text style={paragraph}>
          This link only be valid for the next 7 days. If the link does not work, try to reach out
          to the support team and raise your query:
        </Text>
        <Hr style={hr} />
        <Link href="https://authsmith.com" style={reportLink}>
          AuthSmith
        </Link>
      </Container>
    </Body>
  </Html>
)

const logo = {
  borderRadius: 21,
  width: 42,
  height: 42,
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
}

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
}

const buttonContainer = {
  padding: '27px 0 27px',
}

const button = {
  backgroundColor: '#0751CF',
  borderRadius: '0px',
  fontWeight: '600',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '11px 23px',
}

const reportLink = {
  fontSize: '14px',
  color: '#b4becc',
}

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
}
export const renderForgotPasswordTemplate = async (props: Props) =>
  await render(<ForgotPasswordTemplate {...props} />)
