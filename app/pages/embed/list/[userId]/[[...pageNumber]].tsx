import { GetServerSideProps } from 'next';
import {
  EmbedColorMode,
  EmbedContext,
} from '../../../../components/EmbedContext.js';
import { EmbedStyling } from '../../../../components/EmbedStyling.js';
import { Link } from '../../../../components/Link.js';
import {
  LinkablePuzzle,
  PuzzleResultLink,
} from '../../../../components/PuzzleLink.js';
import { EmbedOptionsT } from '../../../../lib/embedOptions.js';
import { useEmbedOptions } from '../../../../lib/hooks.js';
import { paginatedPuzzles } from '../../../../lib/paginatedPuzzles.js';
import { getEmbedProps } from '../../../../lib/serverOnly.js';
import { withTranslation } from '../../../../lib/translation.js';
import styles from './pageNumber.module.css';

interface PageProps {
  userId: string;
  puzzles: LinkablePuzzle[];
  nextPage: number | null;
  currentPage: number;
  prevPage: number | null;
  embedOptions?: EmbedOptionsT;
}

const gssp: GetServerSideProps<PageProps> = async ({ params, query }) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!params?.userId || Array.isArray(params.userId)) {
    return { notFound: true };
  }

  const pn = params.pageNumber;
  let page: number;
  if (pn === undefined) {
    page = 0;
  } else if (Array.isArray(pn) && pn.length === 1 && pn[0]) {
    page = parseInt(pn[0]);
    if (page.toString() !== pn[0] || page < 0) {
      return { notFound: true };
    }
  } else {
    return { notFound: true };
  }

  const [puzzles, hasNext] = await paginatedPuzzles(
    page,
    10,
    'a',
    params.userId
  );

  const props = {
    props: {
      userId: params.userId,
      puzzles,
      currentPage: page,
      prevPage: page > 0 ? page - 1 : null,
      nextPage: hasNext ? page + 1 : null,
    },
  };

  const embedOptions = await getEmbedProps({ params, query });

  return { ...props, props: { ...props.props, embedOptions } };
};

export const getServerSideProps = withTranslation(gssp);

export default function ThemedPage(props: PageProps) {
  const [embedStyleProps, embedContext] = useEmbedOptions(
    ('embedOptions' in props && props.embedOptions) || undefined
  );

  let colorModeQuery = '';
  if (embedContext.colorMode !== EmbedColorMode.Default) {
    if (embedContext.colorMode === EmbedColorMode.Light) {
      colorModeQuery = 'color-mode=light';
    } else {
      colorModeQuery = 'color-mode=dark';
    }
  }

  return (
    <>
      <EmbedStyling {...embedStyleProps} />
      <EmbedContext.Provider value={embedContext}>
        <div className={styles.wrap}>
          {props.puzzles.map((p, i) => (
            <PuzzleResultLink
              noTargetBlank={true}
              fromEmbedPage={props.currentPage}
              addQueryString={colorModeQuery}
              fullWidth={true}
              key={i}
              puzzle={p}
              showDate={true}
              showBlogPost={true}
              showAuthor={false}
              constructorIsPatron={false}
              filterTags={[]}
            />
          ))}
          {props.nextPage || props.prevPage !== null ? (
            <p className="textAlignCenter">
              {props.prevPage === 0 ? (
                <Link
                  className="marginRight2em"
                  href={`/embed/list/${props.userId}${
                    colorModeQuery ? '?' + colorModeQuery : ''
                  }`}
                  noTargetBlank={true}
                >
                  ← Newer Puzzles
                </Link>
              ) : (
                ''
              )}
              {props.prevPage ? (
                <Link
                  className="marginRight2em"
                  href={`/embed/list/${props.userId}/${props.prevPage}${
                    colorModeQuery ? '?' + colorModeQuery : ''
                  }`}
                  noTargetBlank={true}
                >
                  ← Newer Puzzles
                </Link>
              ) : (
                ''
              )}
              {props.nextPage !== null ? (
                <Link
                  href={`/embed/list/${props.userId}/${props.nextPage}${
                    colorModeQuery ? '?' + colorModeQuery : ''
                  }`}
                  noTargetBlank={true}
                >
                  Older Puzzles →
                </Link>
              ) : (
                ''
              )}
            </p>
          ) : (
            ''
          )}
        </div>
      </EmbedContext.Provider>
    </>
  );
}
