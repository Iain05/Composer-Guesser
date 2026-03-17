package org.composerguesser.backend.service;

import org.composerguesser.backend.model.Excerpt;
import org.composerguesser.backend.model.ExcerptDay;
import org.composerguesser.backend.repository.ExcerptDayRepository;
import org.composerguesser.backend.repository.ExcerptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    public DailyChallengeScheduler(ExcerptDayRepository excerptDayRepository,
                                   ExcerptRepository excerptRepository) {
        this.excerptDayRepository = excerptDayRepository;
        this.excerptRepository = excerptRepository;
    }

    /**
     * Runs at 23:59 every night (America/Vancouver).
     * If tomorrow has no daily challenge, picks the least-used excerpt at random
     * and schedules it, incrementing its times_used counter.
     */
    @Scheduled(cron = "0 59 23 * * *", zone = "America/Vancouver")
    @Transactional
    public void scheduleTomorrowsChallenge() {
        LocalDate tomorrow = LocalDate.now(VANCOUVER).plusDays(1);

        if (excerptDayRepository.existsById(tomorrow)) {
            log.info("Daily challenge for {} already scheduled — skipping.", tomorrow);
            return;
        }

        Excerpt excerpt = excerptRepository.findLeastUsedRandom()
                .orElse(null);

        if (excerpt == null) {
            log.error("No excerpts found in the pool — cannot schedule daily challenge for {}.", tomorrow);
            return;
        }

        excerpt.setTimesUsed(excerpt.getTimesUsed() + 1);
        excerptRepository.save(excerpt);

        ExcerptDay day = new ExcerptDay();
        day.setDate(tomorrow);
        day.setExcerpt(excerpt);
        excerptDayRepository.save(day);

        log.info("Scheduled daily challenge for {}: excerpt {} (times_used now {}).",
                tomorrow, excerpt.getExcerptId(), excerpt.getTimesUsed());
    }
}
