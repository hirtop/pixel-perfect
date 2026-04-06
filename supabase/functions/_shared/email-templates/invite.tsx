/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to BOBOX Remodel</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>BOBOX <span style={brandSub}>Remodel</span></Text>
        <Heading style={h1}>You've been invited</Heading>
        <Text style={text}>
          You've been invited to join BOBOX Remodel. Tap the button below to
          accept the invitation and create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '480px' as const }
const brand = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  fontFamily: "'DM Serif Display', Georgia, serif",
  color: '#1e2a30',
  margin: '0 0 32px',
  letterSpacing: '-0.02em',
}
const brandSub = {
  fontFamily: "'DM Sans', Arial, sans-serif",
  fontSize: '13px',
  fontWeight: '500' as const,
  color: '#666e7a',
  letterSpacing: '0',
  marginLeft: '4px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  fontFamily: "'DM Serif Display', Georgia, serif",
  color: '#1e2a30',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#666e7a',
  lineHeight: '1.6',
  margin: '0 0 28px',
  fontFamily: "'DM Sans', Arial, sans-serif",
}
const button = {
  backgroundColor: 'hsl(174, 62%, 32%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  fontFamily: "'DM Sans', Arial, sans-serif",
}
const footer = {
  fontSize: '13px',
  color: '#999999',
  margin: '36px 0 0',
  lineHeight: '1.5',
  fontFamily: "'DM Sans', Arial, sans-serif",
}
