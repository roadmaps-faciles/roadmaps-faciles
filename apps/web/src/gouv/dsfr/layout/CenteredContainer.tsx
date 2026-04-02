import { Container, type ContainerProps } from "./Container";
import { Grid, GridCol } from "./Grid";

export type CenteredContainerProps = {
  /**
   * For internal Grid
   */
  haveGutters?: boolean;
} & ContainerProps;
export const CenteredContainer = ({ children, haveGutters, ...rest }: CenteredContainerProps) => (
  <Container {...rest}>
    <Grid haveGutters={haveGutters} align="center">
      <GridCol md={10} lg={8}>
        {children}
      </GridCol>
    </Grid>
  </Container>
);
