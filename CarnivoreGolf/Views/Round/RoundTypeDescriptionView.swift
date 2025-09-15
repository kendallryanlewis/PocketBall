import SwiftUI

struct RoundTypeDescriptionView: View {
    let roundType: RoundType
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header with icon and title
                    HStack(spacing: 16) {
                        Image(systemName: roundType.icon)
                            .font(.system(size: 40))
                            .foregroundColor(roundType.color)
                            .frame(width: 60, height: 60)
                            .background(roundType.color.opacity(0.1))
                            .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(roundType.displayName)
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            
                            Text(roundType.shortDescription)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    
                    // Scoring indicator
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("SCORING METHOD")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.secondary)
                                .textCase(.uppercase)
                                .kerning(1)
                            
                            Text(roundType.scoringIndicator)
                                .font(.headline)
                                .foregroundColor(.primary)
                        }
                        Spacer()
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                    
                    // Detailed description
                    VStack(alignment: .leading, spacing: 16) {
                        Text("How to Play")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        
                        Text(roundType.detailedDescription)
                            .font(.body)
                            .lineSpacing(2)
                            .foregroundColor(.primary)
                    }
                    .padding(.horizontal)
                    
                    Spacer(minLength: 100) // Extra space for bottom padding
                }
                .padding(.vertical)
            }
            .navigationTitle("Round Type")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.green)
                }
            }
        }
    }
}

#Preview {
    RoundTypeDescriptionView(roundType: .carnivore)
}