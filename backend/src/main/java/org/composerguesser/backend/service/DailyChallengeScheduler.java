package org.composerguesser.backend.service;

import org.composerguesser.backend.model.Excerpt;
import org.composerguesser.backend.model.ExcerptDay;
import org.composerguesser.backend.repository.ExcerptDayRepository;
import org.composerguesser.backend.repository.ExcerptRepository;
import org.composerguesser.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
public class DailyChallengeScheduler {

    private static final Logger log = LoggerFactory.getLogger(DailyChallengeScheduler.class);
    private static final ZoneId VANCOUVER = ZoneId.of("America/Vancouver");

    private final ExcerptDayRepository excerptDayRepository;
    private final ExcerptRepository excerptRepository;
    private final UserRepository userRepository;

    public DailyChallengeScheduler(ExcerptDayRepository excerptDayRepository,
            ExcerptRepository excerptRepository,
            UserRepository userRepository) {
        this.excerptDayRepository = excerptDayRepository;
        this.excerptRepository = excerptRepository;
        this.userRepository = userRepository;
    }

    /**
     * Scheduled nightly at 23:59 (America/Vancouver). Ensures tomorrow's and the
     * following days daily challenges are assigned before the day rolls over.
     * No-ops if tomorrow already has an entry.
     */
    @Scheduled(cron = "0 59 23 * * *", zone = "America/Vancouver")
    @Transactional
    public void scheduleUpcomingChallenges() {
        ensureChallengeExists(LocalDate.now(VANCOUVER).plusDays(1));
        ensureChallengeExists(LocalDate.now(VANCOUVER).plusDays(2));
    }

    /**
     * Scheduled nightly at 00:01 (America/Vancouver). Resets {@code current_streak}
     * to 0
     * for any user who has a streak but did not earn points yesterday.
     */
    @Scheduled(cron = "0 1 0 * * *", zone = "America/Vancouver")
    @Transactional
    public void expireStreaks() {
        resetExpiredStreaks();
    }

    /**
     * Runs once on application startup to catch up on any maintenance missed while
     * the backend
     * was down. Ensures both today and tomorrow have a daily challenge assigned,
     * then runs
     * streak expiry in case the midnight job was skipped.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onStartup() {
        LocalDate today = LocalDate.now(VANCOUVER);
        ensureChallengeExists(today);
        ensureChallengeExists(today.plusDays(1));
        resetExpiredStreaks();
    }

    /**
     * Assigns a daily challenge for {@code date} if one does not already exist.
     * Selects the excerpt with the lowest {@code times_used} count (random
     * tiebreak)
     * and increments its counter to maintain round-robin fairness across the pool.
     */
    private void ensureChallengeExists(LocalDate date) {
        if (excerptDayRepository.existsById(date)) {
            log.info("Daily challenge for {} already exists — skipping.", date);
            return;
        }

        Excerpt excerpt = excerptRepository.findLeastUsedRandom().orElse(null);
        if (excerpt == null) {
            log.error("No excerpts in pool — cannot schedule challenge for {}.", date);
            return;
        }

        excerpt.setTimesUsed(excerpt.getTimesUsed() + 1);
        excerptRepository.save(excerpt);

        ExcerptDay day = new ExcerptDay();
        day.setDate(date);
        day.setExcerpt(excerpt);
        excerptDayRepository.save(day);

        log.info("Scheduled daily challenge for {}: excerpt {} (times_used now {}).",
                date, excerpt.getExcerptId(), excerpt.getTimesUsed());
    }

    /**
     * Resets {@code current_streak} to 0 for every user who has a streak but no
     * {@code tbl_user_point} entry for yesterday, excluding the submitter of
     * yesterday's excerpt (their streak is preserved). Then increments the streak
     * for the submitter of today's excerpt, since their featured day counts as a
     * participation day. If today's and yesterday's excerpts share the same submitter
     * (back-to-back featured challenges), the increment step is skipped — the
     * exclusion above is sufficient and calling the increment would overwrite the
     * preserved streak with 1 (since own-excerpt guesses never produce a point entry).
     */
    private void resetExpiredStreaks() {
        LocalDate today = LocalDate.now(VANCOUVER);
        LocalDate yesterday = today.minusDays(1);

        Long yesterdaySubmitterId = excerptDayRepository.findById(yesterday)
                .map(day -> day.getExcerpt().getUploadedByUserId())
                .orElse(-1L);

        int count = userRepository.resetExpiredStreaks(yesterday, yesterdaySubmitterId);
        if (count > 0) {
            log.info("Expired streaks for {} user(s) who missed {}.", count, yesterday);
        } else {
            log.info("No streaks expired for {}.", yesterday);
        }

        excerptDayRepository.findById(today).ifPresent(day -> {
            Long submitterId = day.getExcerpt().getUploadedByUserId();
            if (submitterId.equals(yesterdaySubmitterId)) {
                // Same user submitted both consecutive days; the exclusion above already
                // preserved their streak — calling incrementStreakForSubmitter would
                // overwrite it with 1 because they have no point entry for yesterday
                // (they can't earn points on their own excerpt).
                log.info("Skipping streak increment for submitter of today's excerpt (userId={}) — already protected as yesterday's submitter.", submitterId);
                return;
            }
            userRepository.incrementStreakForSubmitter(submitterId, yesterday);
            log.info("Incremented streak for submitter of today's excerpt (userId={}).", submitterId);
        });
    }
}
