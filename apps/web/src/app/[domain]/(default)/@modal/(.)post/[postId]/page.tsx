import { DsfrPage } from "@/gouv/dsfr/layout/DsfrPage";

import { PostPageComponent, PostPageHOP, PostPageTitle } from "../../../post/[postId]/PostPageHOP";
import { PostSimpleModal } from "./PostSimpleModal";

const PostModal = PostPageHOP(props => {
  return (
    <DsfrPage>
      <PostSimpleModal
        id="post-modal"
        title={<PostPageTitle {...props} />}
        size="large"
        buttons={{
          children: "Voir plus de détails",
          refresh: true,
          nativeButtonProps: {},
        }}
      >
        <PostPageComponent {...props} isModal />
      </PostSimpleModal>
    </DsfrPage>
  );
});

export default PostModal;
