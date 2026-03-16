package org.composerguesser.backend.controller;

import org.composerguesser.backend.dto.GuessRequestDto;
import org.composerguesser.backend.dto.GuessResultDto;
import org.composerguesser.backend.service.GuessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/guess")
public class GuessController {

    private final GuessService guessService;

    public GuessController(GuessService guessService) {
        this.guessService = guessService;
    }

    @PostMapping
    public ResponseEntity<GuessResultDto> submitGuess(@RequestBody GuessRequestDto request) {
        try {
            return ResponseEntity.ok(guessService.processGuess(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
