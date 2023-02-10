import PageLayout from 'wrappers/page';
import MyGfw from 'layouts/my-gfw';

import { setupCsrf } from 'utils/csrf';

export const getServerSideProps = setupCsrf(async () => {
  return { props: {} };
});

const MyGfwPage = () => (
  <PageLayout
    title="My GFW | Global Forest Watch"
    description="Create an account or log into My GFW. Explore the status of forests in custom areas by layering data to create custom maps of forest change, cover and use."
    noIndex
  >
    <MyGfw />
  </PageLayout>
);

export default MyGfwPage;
