import Head from "next/head";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { api } from "@src/utils/api";
import { appRouter } from "@src/server/api/root";
import { prisma } from "@src/server/db";
import { Header } from "@src/components/layouts/Header";
import { ProfileImage } from "@src/components/avatar/ProfileImage";
import { MainSection } from "@src/components/layouts/MainSection";
import { PostsCarousel } from "@src/components/post/PostsCarousel";

import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";

type ProfilePageProps = InferGetStaticPropsType<typeof getStaticProps> & { username: string };

const ProfilePage: NextPage<ProfilePageProps> = ({ username }) => {
  const { data: user } = api.profile.getUserByUsername.useQuery({ username });

  if (!user) return <div>404</div>;

  return (
    <>
      <Head>
        <title>@{username}</title>
      </Head>
      <main>
        <Header />
        <MainSection>
          <div className="relative h-44 bg-gray-500">
            <div className="absolute bottom-0 translate-y-1/2 px-4">
              <ProfileImage imageUrl={user.imageUrl} username={user.username!} size="lg" />
            </div>
          </div>
          <div className="border-b p-4 pt-20">
            <span className="text-3xl">@{user.username}</span>
          </div>
          <PostsCarousel userId={user.id} />
        </MainSection>
      </main>
    </>
  );
};

const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("No Slug");

  const username = slug.replace("@", "");
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export { getStaticProps, getStaticPaths };
export default ProfilePage;
