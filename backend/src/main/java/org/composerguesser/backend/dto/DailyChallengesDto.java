package org.composerguesser.backend.dto;

public class DailyChallengesDto {

    private Entry today;
    private Entry tomorrow;

    public Entry getToday() { return today; }
    public void setToday(Entry today) { this.today = today; }

    public Entry getTomorrow() { return tomorrow; }
    public void setTomorrow(Entry tomorrow) { this.tomorrow = tomorrow; }

    public static class Entry {
        private final Long excerptId;
        private final String excerptName;
        private final String composerName;
        private final Integer challengeNumber;

        public Entry(Long excerptId, String excerptName, String composerName, Integer challengeNumber) {
            this.excerptId = excerptId;
            this.excerptName = excerptName;
            this.composerName = composerName;
            this.challengeNumber = challengeNumber;
        }

        public Long getExcerptId() { return excerptId; }
        public String getExcerptName() { return excerptName; }
        public String getComposerName() { return composerName; }
        public Integer getChallengeNumber() { return challengeNumber; }
    }
}
