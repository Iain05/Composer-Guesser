package org.composerguesser.backend.dto;

public class DailyChallengeDto {

    private final Long excerptId;
    private final String audioUrl;
    private final Integer challengeNumber;
    private final String date;

    public DailyChallengeDto(Long excerptId, String audioUrl, Integer challengeNumber, String date) {
        this.excerptId = excerptId;
        this.audioUrl = audioUrl;
        this.challengeNumber = challengeNumber;
        this.date = date;
    }

    public Long getExcerptId() { return excerptId; }
    public String getAudioUrl() { return audioUrl; }
    public Integer getChallengeNumber() { return challengeNumber; }
    public String getDate() { return date; }
}
