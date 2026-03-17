package org.composerguesser.backend.dto;

public class MyRankDto {
    private final String username;
    private final int allTimeRank;
    private final int allTimePoints;
    private final Integer dailyRank;
    private final Integer dailyPoints;
    private final int streak;

    public MyRankDto(String username, int allTimeRank, int allTimePoints, Integer dailyRank, Integer dailyPoints, int streak) {
        this.username = username;
        this.allTimeRank = allTimeRank;
        this.allTimePoints = allTimePoints;
        this.dailyRank = dailyRank;
        this.dailyPoints = dailyPoints;
        this.streak = streak;
    }

    public String getUsername() { return username; }
    public int getAllTimeRank() { return allTimeRank; }
    public int getAllTimePoints() { return allTimePoints; }
    public Integer getDailyRank() { return dailyRank; }
    public Integer getDailyPoints() { return dailyPoints; }
    public int getStreak() { return streak; }
}
