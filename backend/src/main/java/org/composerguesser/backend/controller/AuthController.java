package org.composerguesser.backend.controller;

import org.composerguesser.backend.dto.AuthResponseDto;
import org.composerguesser.backend.dto.LoginRequestDto;
import org.composerguesser.backend.dto.RegisterRequestDto;
import org.composerguesser.backend.model.User;
import org.composerguesser.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@RequestBody RegisterRequestDto request) {
        try {
            return ResponseEntity.ok(userService.register(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto request) {
        try {
            return ResponseEntity.ok(userService.login(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponseDto> me(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(new AuthResponseDto(null, user.getDisplayUsername(), user.getEmail(), user.getTotalPoints()));
    }
}
