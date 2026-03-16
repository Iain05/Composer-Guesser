package org.composerguesser.backend.controller;

import org.composerguesser.backend.dto.GuessRequestDto;
import org.composerguesser.backend.dto.GuessResultDto;
import org.composerguesser.backend.model.User;
import org.composerguesser.backend.service.GuessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/guess")
public class GuessController {

    private final GuessService guessService;

    public GuessController(GuessService guessService) {
        this.guessService = guessService;
    }

    @PostMapping
    public ResponseEntity<GuessResultDto> submitGuess(@RequestBody GuessRequestDto request,
                                                      @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(guessService.processGuess(request, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
