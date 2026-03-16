package org.composerguesser.backend.service;

import org.composerguesser.backend.dto.AuthResponseDto;
import org.composerguesser.backend.dto.LoginRequestDto;
import org.composerguesser.backend.dto.RegisterRequestDto;
import org.composerguesser.backend.model.User;
import org.composerguesser.backend.repository.UserRepository;
import org.composerguesser.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDto register(RegisterRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setDisplayUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setTotalPoints(0);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, user.getDisplayUsername(), user.getEmail(), user.getTotalPoints());
    }

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .or(() -> userRepository.findByUsername(request.getEmail()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, user.getDisplayUsername(), user.getEmail(), user.getTotalPoints());
    }
}
