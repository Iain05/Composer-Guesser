package org.composerguesser.backend.service;

import org.composerguesser.backend.dto.GuessRequestDto;
import org.composerguesser.backend.dto.GuessResultDto;
import org.composerguesser.backend.model.*;
import org.composerguesser.backend.repository.ComposerRepository;
import org.composerguesser.backend.repository.ExcerptRepository;
import org.composerguesser.backend.repository.UserPointRepository;
import org.composerguesser.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class GuessService {

    private static final int POINTS_PER_WIN = 5;
    private static final ZoneId VANCOUVER = ZoneId.of("America/Vancouver");

    private final ExcerptRepository excerptRepository;
    private final ComposerRepository composerRepository;
    private final UserRepository userRepository;
    private final UserPointRepository userPointRepository;

    public GuessService(ExcerptRepository excerptRepository, ComposerRepository composerRepository,
                        UserRepository userRepository, UserPointRepository userPointRepository) {
        this.excerptRepository = excerptRepository;
        this.composerRepository = composerRepository;
        this.userRepository = userRepository;
        this.userPointRepository = userPointRepository;
    }

    @Transactional
    public GuessResultDto processGuess(GuessRequestDto request, User user) {
        Excerpt excerpt = excerptRepository.findById(request.getExcerptId())
                .orElseThrow(() -> new IllegalArgumentException("Excerpt not found"));

        Composer target = composerRepository.findById(excerpt.getComposerId())
                .orElseThrow(() -> new IllegalArgumentException("Target composer not found"));

        Composer guessed = composerRepository.findById(request.getComposerId())
                .orElseThrow(() -> new IllegalArgumentException("Guessed composer not found"));

        boolean correct = guessed.getComposerId().equals(target.getComposerId());

        String composerHint = correct ? "correct" : "wrong";

        String yearHint;
        if (guessed.getBirthYear().equals(target.getBirthYear())) {
            yearHint = "CORRECT";
        } else if (guessed.getBirthYear() < target.getBirthYear()) {
            yearHint = "TOO_LOW";
        } else {
            yearHint = "TOO_HIGH";
        }

        String eraHint = getEraHint(guessed.getEra(), target.getEra());
        String nationalityHint = guessed.getNationality().equals(target.getNationality()) ? "correct" : "wrong";

        int pointsEarned = 0;
        if (correct && user != null) {
            LocalDate today = LocalDate.now(VANCOUVER);
            if (!userPointRepository.existsByUserIdAndExcerptDayDate(user.getUserId(), today)) {
                userPointRepository.save(new UserPoint(user.getUserId(), today, POINTS_PER_WIN, LocalDateTime.now(VANCOUVER)));
                user.setTotalPoints(user.getTotalPoints() + POINTS_PER_WIN);
                userRepository.save(user);
                pointsEarned = POINTS_PER_WIN;
            }
        }

        return new GuessResultDto(
                correct,
                guessed.getFirstName() + " " + guessed.getLastName(),
                guessed.getBirthYear(),
                guessed.getEra().name(),
                guessed.getNationality(),
                composerHint,
                yearHint,
                eraHint,
                nationalityHint,
                excerpt.getName(),
                target.getFirstName() + " " + target.getLastName(),
                pointsEarned
        );
    }

    private String getEraHint(Era guessed, Era target) {
        if (guessed == target) return "correct";
        return Math.abs(guessed.ordinal() - target.ordinal()) == 1 ? "close" : "wrong";
    }
}
