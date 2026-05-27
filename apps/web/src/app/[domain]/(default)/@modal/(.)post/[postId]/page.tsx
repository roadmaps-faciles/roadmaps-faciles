import { DsfrPage } from "@/gouv/dsfr/layout/DsfrPage";

import { PostPageComponent, PostPageHOP, PostPageTitle } from "../../../post/[postId]/PostPageHOP";
import { PostDialogModal } from "./PostDialogModal";
import { PostSimpleModal } from "./PostSimpleModal";

const PostModal = PostPageHOP(props => {
  if (props.theme === "Dsfr") {
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
  }

  return (
    <PostDialogModal title={<PostPageTitle {...props} />}>
      <PostPageComponent {...props} isModal />
    </PostDialogModal>
  );
});

export default PostModal;
