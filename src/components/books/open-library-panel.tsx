import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Overline, Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { languageName, type OpenLibraryDetails } from '@/services/open-library';

export type OpenLibraryPanelProps = {
  state: 'loading' | 'ready' | 'error' | 'none';
  details: OpenLibraryDetails | null;
  message?: string;
};

/** One cell of the three-up statistic row. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="titleLg" color="onSurface">
        {value}
      </Text>
      <Overline color="onSurfaceMuted">{label}</Overline>
    </View>
  );
}

/**
 * Live data from Open Library, kept in its own card and labelled as such.
 *
 * The boundary is deliberate: everything above this panel is the library's own
 * record, everything inside it came from a third party a moment ago and may be
 * missing, stale or absent entirely. Presenting them as one merged blob would
 * hide which is which.
 */
export function OpenLibraryPanel({ state, details, message }: OpenLibraryPanelProps) {
  const hasRating = details?.ratingAverage != null && details.ratingCount != null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Overline color="onSurfaceMuted">From Open Library</Overline>
        <Pill label="Live" tone="accent" dot />
      </View>

      {state === 'loading' ? (
        <View style={styles.centred}>
          <ActivityIndicator color={Colors.primary} />
          <Text variant="caption" color="onSurfaceMuted">
            Looking this book up…
          </Text>
        </View>
      ) : state === 'error' ? (
        <View style={styles.notice}>
          <Ionicons name="cloud-offline-outline" size={18} color={Colors.onSurfaceMuted} />
          <Text variant="caption" color="onSurfaceMuted" style={styles.noticeText}>
            {message ?? 'Could not reach Open Library.'}
          </Text>
        </View>
      ) : state === 'none' || !details ? (
        <View style={styles.notice}>
          <Ionicons name="help-circle-outline" size={18} color={Colors.onSurfaceMuted} />
          <Text variant="caption" color="onSurfaceMuted" style={styles.noticeText}>
            {message ?? 'Open Library has no record for this ISBN.'}
          </Text>
        </View>
      ) : (
        <>
          {hasRating ? (
            <View style={styles.rating}>
              <Ionicons name="star" size={18} color={Colors.primary} />
              <Text variant="titleLg" color="onSurface">
                {details.ratingAverage!.toFixed(2)}
              </Text>
              <Text variant="caption" color="onSurfaceMuted">
                from {details.ratingCount!.toLocaleString()} readers
              </Text>
            </View>
          ) : null}

          <View style={styles.stats}>
            <Stat
              value={details.pageCount ? String(details.pageCount) : '—'}
              label="Pages"
            />
            <View style={styles.divider} />
            <Stat
              value={details.editionCount ? String(details.editionCount) : '—'}
              label="Editions"
            />
            <View style={styles.divider} />
            <Stat
              value={details.firstPublishYear ? String(details.firstPublishYear) : '—'}
              label="First published"
            />
          </View>

          {details.subjects.length > 0 ? (
            <View style={styles.block}>
              <Text variant="label" color="onSurfaceMuted">
                Subjects
              </Text>
              <View style={styles.subjects}>
                {details.subjects.map((subject) => (
                  <View key={subject} style={styles.subject}>
                    <Text variant="caption" color="onSurfaceVariant" numberOfLines={1}>
                      {subject}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {details.languages.length > 0 ? (
            <View style={styles.row}>
              <Text variant="caption" color="onSurfaceMuted">
                Languages
              </Text>
              <Text variant="caption" color="onSurfaceVariant" style={styles.rowValue}>
                {details.languages.map(languageName).join(' · ')}
              </Text>
            </View>
          ) : null}

          {details.publishers.length > 0 ? (
            <View style={styles.row}>
              <Text variant="caption" color="onSurfaceMuted">
                Publishers
              </Text>
              <Text
                variant="caption"
                color="onSurfaceVariant"
                numberOfLines={2}
                style={styles.rowValue}>
                {details.publishers.join(' · ')}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.gutter,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  centred: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.x5,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.outline,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: Colors.outline,
  },
  block: {
    gap: Spacing.md,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  subject: {
    maxWidth: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xs,
    backgroundColor: Colors.surfaceVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
  },
});
