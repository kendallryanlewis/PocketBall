import SwiftUI

struct ViewRoundsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var rounds: [Round] = []
    @State private var roundToDelete: Round? = nil
    @State private var showDeleteAlert = false
    @State private var showDeleteError = false
    @State private var deleteErrorMessage = ""
    @State private var sortOption = SortOption.dateDesc
    
    enum SortOption: String, CaseIterable {
        case dateDesc = "Latest First"
        case dateAsc = "Oldest First"
        case courseName = "Course Name"
        
        func sort(_ rounds: [Round]) -> [Round] {
            switch self {
            case .dateDesc:
                return rounds.sorted { $0.date > $1.date }
            case .dateAsc:
                return rounds.sorted { $0.date < $1.date }
            case .courseName:
                return rounds.sorted { $0.courseName < $1.courseName }
            }
        }
    }
    
    var sortedRounds: [Round] {
        sortOption.sort(rounds)
    }
    
    var body: some View {
        ZStack {
            BackgroundView()
            VStack(spacing: 0) {
                // Header
                Button(action: { dismiss() }) {
                    GenericHeader(title: "Round History", iconName: "chevron.left")
                }
                
                // Sort Picker
                Picker("Sort", selection: $sortOption) {
                    ForEach(SortOption.allCases, id: \.self) { option in
                        Text(option.rawValue).tag(option)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 20)
                
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(sortedRounds) { round in
                            HStack {
                                RoundCard(round: round, isRecent: false)
                                    .padding(.leading)
                                
                                Button(action: {
                                    roundToDelete = round
                                    showDeleteAlert = true
                                }) {
                                    Image(systemName: "trash")
                                        .foregroundColor(.red)
                                        .padding(.trailing, 24)
                                }
                            }
                        }.font(.body)
                    }
                    .padding(.top, 20)
                }
            }
            .padding(28)
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            loadRounds()
        }
        .alert(isPresented: $showDeleteAlert) {
            Alert(
                title: Text("Delete Round"),
                message: Text("Are you sure you want to delete this round? This action cannot be undone."),
                primaryButton: .destructive(Text("Delete")) {
                    deleteRound()
                },
                secondaryButton: .cancel {
                    roundToDelete = nil
                }
            )
        }
        .alert("Error", isPresented: $showDeleteError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(deleteErrorMessage)
        }
    }
    
    private func loadRounds() {
        rounds = (try? RoundHistoryManager.shared.loadRounds().get()) ?? []
    }
    
    private func deleteRound() {
        guard let round = roundToDelete else { return }
        
        let result = RoundHistoryManager.shared.deleteRound(by: round.id)
        switch result {
        case .success:
            loadRounds() // Refresh the list
        case .failure(let error):
            deleteErrorMessage = error.localizedDescription
            showDeleteError = true
        }
        roundToDelete = nil
    }
}

#Preview {
    ViewRoundsView()
}
