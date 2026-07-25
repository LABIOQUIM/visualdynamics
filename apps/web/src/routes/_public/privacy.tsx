import classes from "./privacy.module.css";

import { Box } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderCallToActionSection } from "./-components/CallToActionSection";
import { LanderLayout } from "./-components/Layout";

import { Heading } from "@/components/Heading";
import { buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";
import { loadRuntimeSeoData } from "@/lib/seo.runtime";

export const Route = createFileRoute("/_public/privacy")({
  loader: () => loadRuntimeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: "Privacy Policy",
      description:
        "Visual Dynamics privacy policy — learn how we handle your personal data.",
      path: "/privacy",
      index: false,
      siteUrl: loaderData?.siteUrl ?? DEFAULT_SITE_URL,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Heading centered title="Privacy Policy" />
      <Box className={classes.content}>
        <Section title="1. Introduction">
          <p>
            The Visual Dynamics platform, developed and maintained by Fiocruz
            through LABIOQUIM, is committed to protecting the privacy and
            personal data of its users. This Privacy Policy describes how we
            collect, use, store, and protect your information, in compliance
            with the Brazilian General Data Protection Law (Law No. 13.709/2018
            — LGPD).
          </p>
        </Section>

        <Section title="2. Data Collected">
          <p>To provide our services, we may collect the following data:</p>
          <ul>
            <li>
              <strong>Registration data:</strong> full name, institutional email
              address, and access password, provided by you at the time of
              registration.
            </li>
            <li>
              <strong>Platform usage data:</strong> molecular structure files
              (PDB, GRO, etc.), simulation parameters, and results generated
              during use of the tool.
            </li>
            <li>
              <strong>Browsing data:</strong> IP address, browser type,
              operating system, pages visited, and visit duration, collected
              automatically for security and platform improvement purposes.
            </li>
          </ul>
        </Section>

        <Section title="3. Purpose of Processing">
          <p>Your data is processed for the following purposes:</p>
          <ul>
            <li>Enabling access to the platform and its features;</li>
            <li>Processing and running molecular dynamics simulations;</li>
            <li>Storing simulation history for future reference;</li>
            <li>Providing technical support and responding to inquiries;</li>
            <li>
              Improving the platform based on aggregated and anonymized usage
              metrics;
            </li>
            <li>
              Complying with legal and regulatory obligations applicable to
              Fiocruz.
            </li>
          </ul>
        </Section>

        <Section title="4. Cookies">
          <p>
            We use strictly necessary cookies for the operation of the platform,
            such as session cookies that maintain your authentication during
            use. We do not use tracking cookies for advertising or profiling
            purposes. You may configure your browser to refuse cookies, but this
            may impair the platform's functionality.
          </p>
        </Section>

        <Section title="5. Data Sharing">
          <p>
            Your personal data is not sold, rented, or shared with third parties
            for commercial purposes. Sharing occurs only:
          </p>
          <ul>
            <li>
              With cloud infrastructure providers necessary for the technical
              operation of the platform;
            </li>
            <li>
              By legal determination or request from a competent public
              authority;
            </li>
            <li>
              In collaborative research projects, exclusively with anonymized
              data or with your explicit consent.
            </li>
          </ul>
        </Section>

        <Section title="6. Storage and Security">
          <p>
            We adopt technical and administrative measures to protect your data
            against unauthorized access, loss, alteration, or destruction,
            including encryption in transit and at rest, authentication-based
            access control, and continuous infrastructure monitoring.
          </p>
          <p>
            Your data is stored on servers located in Brazil, in compliance with
            the LGPD, and retained for the period necessary to fulfill the
            purposes described in this policy or as required by law.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>
            Under the LGPD, you have the following rights regarding your
            personal data:
          </p>
          <ul>
            <li>Confirm the existence of processing of your data;</li>
            <li>Access your data stored on the platform;</li>
            <li>Correct incomplete, inaccurate, or outdated data;</li>
            <li>Request deletion of your data, when applicable;</li>
            <li>Withdraw consent, when processing is based on it;</li>
            <li>Obtain information about sharing of your data.</li>
          </ul>
          <p>
            To exercise your rights, contact us using the email address provided
            at the end of this policy.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            This Privacy Policy may be updated periodically to reflect changes
            in our services or applicable legislation. We recommend regularly
            reviewing this page. Substantial changes will be communicated via
            email or through a notice on the platform.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For questions, requests, or to exercise your data subject rights,
            please contact the Data Protection Officer (DPO):
          </p>
          <p>
            <strong>Email:</strong> visualdynamics@fiocruz.br
          </p>
        </Section>

        <p className={classes.lastUpdated}>Last updated: July 25, 2026.</p>
      </Box>
      <LanderCallToActionSection />
    </LanderLayout>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className={classes.section}>
      <h2 className={classes.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}
