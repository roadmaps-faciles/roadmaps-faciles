import { type Metadata } from "next";

import { TrackPageView } from "@/lib/ee/tracking-provider";
import { postViewed } from "@/lib/ee/tracking-provider/trackingPlan";
import { generatePostMetadata } from "@/utils/metadata";

import { PostPageComponent, PostPageHOP, PostPageTitle } from "./PostPageHOP";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ domain: string; postId: string }>;
}): Promise<Metadata> => {
  const { domain, postId } = await params;
  return generatePostMetadata(domain, postId);
};

const PostPage = PostPageHOP(props => {
  return (
    <>
      <TrackPageView
        event={postViewed({
          postId: String(props.post.id),
          boardId: String(props.post.board.id),
          tenantId: String(props.post.tenantId),
        })}
      />
      <div className="mx-auto mt-4 max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1>
          <PostPageTitle {...props} />
        </h1>
        <PostPageComponent {...props} />
      </div>
    </>
  );
});

export default PostPage;
