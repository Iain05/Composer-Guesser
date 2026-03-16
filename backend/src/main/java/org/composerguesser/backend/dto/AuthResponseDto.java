package org.composerguesser.backend.dto;

public class AuthResponseDto {
    private final String token;
    private final String username;
    private final String email;
    private final int totalPoints;

    public AuthResponseDto(String token, String username, String email, int totalPoints) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.totalPoints = totalPoints;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public int getTotalPoints() { return totalPoints; }
}
