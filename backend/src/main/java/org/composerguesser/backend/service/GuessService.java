package org.composerguesser.backend.service;

import org.composerguesser.backend.dto.GuessRequestDto;
import org.composerguesser.backend.dto.GuessResultDto;
import org.composerguesser.backend.model.Composer;
import org.composerguesser.backend.model.Era;
import org.composerguesser.backend.model.Excerpt;
import org.composerguesser.backend.repository.ComposerRepository;
import org.composerguesser.backend.repository.ExcerptRepository;
import org.springframework.stereotype.Service;

@Service
public class GuessService {

    private final ExcerptRepository excerptRepository;
    private final ComposerRepository composerRepository;

    public GuessService(ExcerptRepository excerptRepository, ComposerRepository composerRepository) {
        this.excerptRepository = excerptRepository;
        this.composerRepository = composerRepository;
    }

    public GuessResultDto processGuess(GuessRequestDto request) {
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
                target.getFirstName() + " " + target.getLastName()
        );
    }

    private String getEraHint(Era guessed, Era target) {
        if (guessed == target) return "correct";
        return Math.abs(guessed.ordinal() - target.ordinal()) == 1 ? "close" : "wrong";
    }
}
