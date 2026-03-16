package org.composerguesser.backend.dto;

public class DailyChallengeDto {

    private final Long excerptId;
    private final String audioUrl;

    public DailyChallengeDto(Long excerptId, String audioUrl) {
        this.excerptId = excerptId;
        this.audioUrl = audioUrl;
    }

    public Long getExcerptId() { return excerptId; }
    public String getAudioUrl() { return audioUrl; }
}
